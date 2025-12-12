import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { getChannel } from '../lib/kickApi';

const COOKIE_KEY = 'kick_guest_follows';

const readCookieFollows = () => {
  try {
    const raw = Cookies.get(COOKIE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeCookieFollows = (follows) => {
  Cookies.set(COOKIE_KEY, JSON.stringify(follows), { expires: 30 });
};

export function useFollows() {
  const { user, guest } = useAuth();
  const [follows, setFollows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user || guest) {
      loadFollows();
    } else {
      setFollows([]);
      setStatuses({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, guest]);

  const loadFollows = async () => {
    setLoading(true);
    setError(null);
    try {
      let list = [];

      if (user) {
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'follows'));
        list = snapshot.docs.map((d) => d.id);
      } else if (guest) {
        list = readCookieFollows();
      }

      setFollows(list);
      await hydrateStatuses(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hydrateStatuses = async (list) => {
    if (!list?.length) {
      setStatuses({});
      return;
    }

    const entries = await Promise.all(
      list.map(async (slug) => {
        try {
          const channel = await getChannel(slug);
          return [slug, { ...channel, ok: true }];
        } catch (err) {
          return [slug, { slug, ok: false, error: err.message }];
        }
      }),
    );

    setStatuses(Object.fromEntries(entries));
  };

  const addFollow = async (inputSlug) => {
    const slug = inputSlug.trim().toLowerCase();
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const next = Array.from(new Set([...follows, slug]));

      if (user) {
        await setDoc(doc(collection(db, 'users', user.uid, 'follows'), slug), {
          slug,
          addedAt: Date.now(),
        });
      } else if (guest) {
        writeCookieFollows(next);
      }

      setFollows(next);
      await hydrateStatuses(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFollow = async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const next = follows.filter((s) => s !== slug);

      if (user) {
        await deleteDoc(doc(collection(db, 'users', user.uid, 'follows'), slug));
      } else if (guest) {
        writeCookieFollows(next);
      }

      setFollows(next);
      await hydrateStatuses(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    follows,
    statuses,
    loading,
    error,
    addFollow,
    removeFollow,
    refresh: loadFollows,
  };
}
