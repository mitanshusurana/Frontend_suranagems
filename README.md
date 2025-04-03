
# Gemmological Report Manager  

🌟 **Live Demo**: [suranagemstest.netlify.app](https://suranagemstest.netlify.app)  

**Simplify gemstone inventory management** with an intuitive system to catalog, track, and edit items using QR codes, photo uploads, and detailed reports. Perfect for gemologists, jewelers, or collectors!  

---

## ✨ **Key Features**  
- **Smart Catalog Browsing**  
  View all items in a clean grid with photos, weights, dimensions, and categories. Search or filter to find gems instantly.  
- **QR Code Magic**  
  Scan QR codes with your camera to jump directly to any item’s details – no manual searching!  
- **Perfect Photo Uploads**  
  Upload gemstone photos, crop them to a square (800x800 pixels) for consistency, and store them securely in the cloud.  
- **Effortless Reporting**  
  Generate reports by entering gemstone details (weight, category, etc.) and linking them to unique QR codes.  
- **Edit or Delete**  
  Update gemstone details or remove entries with a single click.  

---

## 🛠️ **Built With**  
- **Frontend**: Angular 18, Tailwind CSS (for sleek designs)  
- **QR Scanning**: ZXing (trusted library for QR/barcode scanning)  
- **Image Editing**: CropperJS (user-friendly photo cropping)  
- **Cloud Storage**: Cloudflare R2 (secure, fast image hosting)  
- **Backend**: Spring Boot (robust API for data management)  
- **Deployment**: Netlify (one-click hosting)  

---

## 🚀 **Getting Started**  

### **Prerequisites**  
- A modern web browser (Chrome, Firefox, or Edge)  
- Node.js installed (to run the app locally)  

### **Installation**  
1. **Clone the Repository**  
   ```bash  
   git clone https://github.com/your-username/gemmological-report.git  
   cd gemmological-report  
   ```  
2. **Install Dependencies**  
   Run `npm install` to fetch all required tools.  
3. **Configure Settings**  
   Add your Cloudflare R2 storage and Spring Boot API details to the environment file.  
4. **Launch the App**  
   Run `npm run dev` and open `http://localhost:4200` in your browser.  

---

## 🔧 **Configuration**  
- **Cloudflare R2 Setup**  
  Create a storage bucket, enable public access, and add your credentials to the app’s settings.  
- **Spring Boot API**  
  Ensure your backend is running and provides endpoints for:  
  - Fetching/editing gemstone data  
  - Handling QR code associations  

---

## 🖼️ **How to Use**  
### **1. Browse the Catalog**  
- Use the search bar to find gems by name, category, or ID.  
- Click any item to view its full details.  

### **2. Create a New Report**  
- Click “New Report” and upload a gemstone photo.  
- Adjust the cropping tool to fit the 800x800px frame.  
- Enter details like weight, dimensions, and category.  
- Assign a unique report ID or scan a QR code to link it.  

### **3. Scan QR Codes**  
- Click the QR scanner icon and point your camera at a code.  
- Instantly navigate to the linked gemstone’s page.  

### **4. Edit or Delete**  
- Open any gemstone’s details and click “Edit” to update information.  
- Use “Delete” to remove outdated entries.  

---

## 🌐 **Deployment**  
This app is hosted on Netlify for fast, reliable access. To deploy your own version:  
1. Connect your GitHub/GitLab repository to Netlify.  
2. Set the build command to `npm run build`.  
3. Deploy – your app goes live in minutes!  

---

## 🤝 **Contribute**  
Love gemstones or coding? We welcome improvements!  
1. Fork the repository.  
2. Create a branch for your feature (`feat/amazing-idea`).  
3. Submit a pull request with a clear description.  

