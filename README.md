# LeetCode History Exporter 🚀

[中文說明](#leetcode-history-exporter-) | [English](#leetcode-history-exporter--1)

---

# LeetCode History Exporter

這是一個瀏覽器擴充功能，可以將您的 LeetCode 提交紀錄匯出為 JSON 檔案。非常適合用來備份您的進度或分析您的刷題歷程！

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.1-green.svg)

## ✨主要功能

*   **自動翻頁匯出**：自動遍歷您的所有提交紀錄頁面並抓取所有資料。
*   **可自訂欄位**：選擇您想要匯出的資料（ID、標題、難度、網址、時間戳記、語言等）。
*   **拖放介面**：在彈出視窗中輕鬆拖放以重新排序匯出欄位。
*   **JSON 輸出**：獲得一份乾淨、結構化的 JSON 格式刷題紀錄。
*   **安全檢查**：在執行前會驗證您是否位於正確的頁面，以防止錯誤。

## 📥 安裝方式

### 從商店安裝
*(待發布後補充 Edge/Chrome 商店連結)*

### 手動安裝 (開發者模式)
1.  複製此 GitHub 倉庫或下載原始碼。
2.  開啟 **Microsoft Edge** 或 **Google Chrome**。
3.  前往擴充功能管理頁面：`edge://extensions/` 或 `chrome://extensions/`。
4.  開啟 **開發人員模式** (通常位於右上角或側邊欄)。
5.  點擊 **載入未封裝項目** (Load unpacked)。
6.  選擇包含 `manifest.json` 的資料夾。

## 📖 使用說明

1.  登入 [LeetCode](https://leetcode.com)。
2.  **必須**前往 **Progress (進度)** 頁面：[https://leetcode.com/progress/](https://leetcode.com/progress/)
    *   *注意：此擴充功能設計為在此頁面運作，若不在該頁面將無法使用。*
3.  點擊瀏覽器工具列中的擴充功能圖示。
4.  (可選) 勾選或排序您想要匯出的欄位。
5.  點擊 **Start Export** 按鈕。
6.  等待處理完成，瀏覽器將會自動下載 `leetcode_submission_history.json` 檔案。

## 🛠️ 開發說明

### 專案結構
*   `manifest.json`: 擴充功能設定檔 (Manifest V3)。
*   `popup.html/js/css`: 擴充功能的彈出視窗介面。
*   `content.js`: 在 LeetCode 頁面上執行的抓取腳本。
*   `icons/`: 擴充功能圖示 (16, 48, 128)。

## 🤝 貢獻
歡迎提交 Pull Request 來協助改進此專案！

## 📄 授權
本專案採用 [MIT License](LICENSE) 開源授權。

---

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
