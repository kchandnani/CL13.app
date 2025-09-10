# FNTZ AI - Fantasy Football Assistant

An intelligent NFL fantasy football companion built with Next.js and TypeScript.

## 🏈 Features

- **AI-Powered Analysis**: Ask questions about your fantasy lineup and get intelligent recommendations
- **Real-Time Injury Tracking**: Monitor injuries for players on your roster using the Sleeper API
- **Modern UI**: Clean, dark-themed interface inspired by popular web applications
- **TypeScript Support**: Fully typed for better development experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4 with React 18
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Data Sources**: Sleeper API for NFL data
- **Future**: Python backend with Hugging Face models

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/ask/          # API route for AI queries (placeholder)
│   ├── globals.css       # Global styles with dark theme
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Main application page
├── components/           # Reusable React components
├── data/
│   └── roster.json       # Sample fantasy roster data
└── utils/
    └── sleeper.ts        # Sleeper API integration
```

## 🔧 Configuration

### Roster Setup
Edit `src/data/roster.json` to include your actual fantasy roster:

```json
{
  "team_name": "Your Team Name",
  "players": [
    {
      "player_id": "4046",
      "name": "Josh Allen",
      "position": "QB",
      "team": "BUF",
      "starter": true
    }
  ]
}
```

### API Integration
The `/api/ask` endpoint is currently a placeholder. It will be connected to a Python backend running Hugging Face models for AI analysis.

## 🏗️ Development Roadmap

- [x] Next.js project setup with TypeScript
- [x] Sleeper API integration for injury data
- [x] Modern UI with dark theme
- [x] Question input and response system
- [ ] Python backend with Hugging Face models
- [ ] Advanced player analytics
- [ ] Historical performance data
- [ ] Trade recommendations
- [ ] Waiver wire suggestions

## 📊 Data Sources

- **Sleeper API**: NFL player data, injuries, and league information
- **Future**: Additional APIs for comprehensive player statistics

## 🤝 Contributing

This is a local development project. Feel free to extend functionality or improve the UI.

## 📝 Notes

- The AI model integration is planned but not yet implemented
- Injury data is fetched from the Sleeper API in real-time
- The application uses a sample roster - replace with your actual team data
- All API calls include proper error handling and loading states 