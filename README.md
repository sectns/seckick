<h1 align="center">Seckick 📺</h1>

<p align="center">
  <strong>Takip ettiğin Kick yayıncılarını tek panelde izle!</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Plyr-00B3FF?style=for-the-badge&logo=plyr&logoColor=white" alt="Plyr">
  <img src="https://img.shields.io/badge/Kick-53FC18?style=for-the-badge&logo=kick&logoColor=black" alt="Kick">
</p>

<br>

**Seckick**, Kick platformundaki favori yayıncılarınızı tek bir kontrol panelinden takip etmenizi, canlılık durumlarını anlık olarak görmenizi ve gelişmiş bir oynatıcı ile izlemenizi sağlayan web tabanlı bir araçtır.

Giriş yapma zorunluluğu olmadan (anonim mod) veya Firebase ile giriş yaparak takiplerinizi senkronize edebilirsiniz. Sohbet entegrasyonu, yayın keyfini bölmeden ayrı bir sekmede çalışacak şekilde tasarlanmıştır.

---

## 🚀 Özellikler

* **⚡ Gerçek Zamanlı Takip:** Yayıncıların canlı olup olmadığını, izleyici sayılarını ve yayın kategorisini anlık olarak görüntüler.
* **🕵️‍♂️ Anonim Mod:** Üye olmadan tarayıcı çerezleri (cookies/local storage) üzerinden takip listesi oluşturabilirsiniz.
* **☁️ Bulut Senkronizasyon (Firebase):** Google hesabı ile giriş yaparak takip listenizi her cihazda senkronize edin (Firestore).
* **📺 Gelişmiş Oynatıcı:** `Plyr` tabanlı, Native HLS destekli özel video oynatıcı ile kesintisiz izleme deneyimi.
* **🛡️ Proxy API:** Node.js tabanlı ara katman (proxy) sayesinde Kick Public API verileri sorunsuz çekilir.
* **💬 Sorunsuz Sohbet:** Giriş doğrulama (CAPTCHA) sorunlarıyla uğraşmamak için sohbet ayrı bir pencerede/sekmede açılır.

## 🛠 Kullanılan Teknolojiler

Bu proje aşağıdaki teknolojiler kullanılarak geliştirilmiştir:

* **Backend:** Node.js (Kick API Proxy sunucusu olarak)
* **Veritabanı & Kimlik Doğrulama:** Google Firebase (Auth & Firestore)
* **Frontend Oynatıcı:** Plyr.js (HLS desteği için)
* **Veri Yönetimi:** LocalStorage (Anonim mod için) & Firestore (Üyeler için)

## 📦 Kurulum

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

### 1. Projeyi Klonlayın
```bash
git clone [https://github.com/sectns/seckick.git](https://github.com/sectns/seckick.git)
cd seckick
