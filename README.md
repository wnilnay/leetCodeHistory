# LeetCode History Exporter 🚀

A browser extension to export your LeetCode submission history to a JSON file. Perfect for backing up your progress or analyzing your coding journey!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.1-green.svg)

## ✨ Features

*   **Paginated Export**: Automatically traverses through your submission history pages to grab all records.
*   **Configurable Fields**: Choose exactly what data you want to export (ID, Title, Difficulty, URL, Timestamp, Language, etc.).
*   **Drag & Drop UI**: Reorder export fields easily in the popup.
*   **JSON Output**: Get a clean, structured JSON file of your coding history.
*   **Safety Checks**: Validates that you are on the correct page before running to prevent errors.

## 📥 Installation

### From Store
*(Add link to Edge/Chrome Web Store here when published)*

### Manual Installation (Developer Mode)
1.  Clone this repository or download the source code.
2.  Open **Microsoft Edge** or **Google Chrome**.
3.  Navigate to `edge://extensions/` or `chrome://extensions/`.
4.  Enable **Developer mode** (toggle in the top-right / sidebar).
5.  Click **Load unpacked**.
6.  Select the folder containing `manifest.json`.

## 📖 Usage

1.  Log in to [LeetCode](https://leetcode.com).
2.  Navigate to the **Progress** page: [https://leetcode.com/progress/](https://leetcode.com/progress/)
    *   *Note: The extension is designed to work efficiently from this page.*
3.  Click the extension icon in your browser toolbar.
4.  (Optional) Configure which fields you want to export.
5.  Click **Start Export**.
6.  Wait for the process to complete. A `leetcode_submission_history.json` file will be downloaded automatically.

## 🛠️ Development

### Project Structure
*   `manifest.json`: Extension configuration (Manifest V3).
*   `popup.html/js/css`: The extension popup interface.
*   `content.js`: The script that runs on the LeetCode page to scrape data.
*   `icons/`: Extension icons (16, 48, 128).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open sourced under the [MIT License](LICENSE).
