# Zerx - Military Strategy Game

Zerx is an ambitious multiplayer military-economic strategy game built with Next.js 16, React, and PostgreSQL. Command your empire, build military bases, train units, conduct research, and engage in strategic battles with players around the world.

## Features

### Military Systems
- **Unit Types**: Infantry, Vehicles, Air Forces, Naval Units
- **Combat System**: Real-time tactical battles with unit loss calculations
- **Base Management**: Build and upgrade multiple military bases across the map
- **Defensive Structures**: Garrison units to protect your bases

### Economic Systems
- **Resource Management**: Money, Steel, Oil, Electronics, Manpower
- **Resource Generation**: Bases generate resources over time
- **Technology Research**: Unlock advanced military technologies
- **Unit Training**: Train diverse military units at your bases

### Multiplayer Features
- **Alliances**: Form or join factions with other players
- **Global Leaderboards**: Compete for dominance
- **Player Profiles**: View stats and achievements
- **Battle History**: Track your victories and defeats

### Game Interface
- **Grid-Based Map**: Visual map display of bases and territories
- **Real-Time UI**: Updates reflect game state changes
- **Resource Panel**: Monitor your resources in real-time
- **Mission System**: Complete objectives for rewards
- **Global Chat**: Communicate with other players

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Neon)
- **State Management**: SWR for data fetching
- **Components**: Custom React components with accessibility focus

## Getting Started

### Prerequisites
- Node.js 18+ (for local development)
- PostgreSQL database (Neon integration is configured)

### Installation

1. **Clone or Download the Project**
   ```bash
   git clone <repo> && cd zerx
   # or download and extract the ZIP
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or pnpm install / yarn install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Neon PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ```

4. **Initialize Database**
   The database migration script (`scripts/01-init-schema.sql`) has already been executed during setup. The following tables were created:
   - `players` - Player accounts and stats
   - `bases` - Military bases
   - `units` - Military units
   - `resources` - Player resources
   - `research` - Technology research
   - `alliances` - Player alliances
   - `alliance_members` - Alliance membership
   - `alliance_invites` - Pending invitations
   - `battles` - Battle history

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
zerx/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication
│   │   ├── player/            # Player data
│   │   ├── bases/             # Base management
│   │   ├── units/             # Unit training
│   │   ├── attack/            # Battle system
│   │   ├── research/          # Technology research
│   │   ├── alliances/         # Alliance management
│   │   ├── leaderboard/       # Rankings
│   │   └── missions/          # Mission system
│   ├── game/                  # Main game page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/                 # React components
│   ├── GameGrid.tsx           # Map display
│   ├── ResourcePanel.tsx      # Resource info
│   ├── BasePanel.tsx          # Base details
│   ├── UnitTraining.tsx       # Unit training UI
│   ├── UnitsDisplay.tsx       # Units listing
│   ├── ResearchLab.tsx        # Research UI
│   ├── BattleCommand.tsx      # Battle interface
│   ├── AlliancePanel.tsx      # Alliance management
│   ├── PlayerStats.tsx        # Player statistics
│   ├── Leaderboard.tsx        # Rankings display
│   ├── Missions.tsx           # Mission tracking
│   ├── GameChat.tsx           # Chat interface
│   ├── Notifications.tsx      # Notification system
│   └── AuthForm.tsx           # Login/Register
├── lib/
│   ├── types/
│   │   └── game.ts            # TypeScript types
│   ├── db.ts                  # Database connection
│   ├── constants.ts           # Game constants
│   ├── game-server.ts         # Game logic
│   └── hooks.ts               # Custom React hooks
├── scripts/
│   └── 01-init-schema.sql    # Database schema
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Game Mechanics

### Resources
Players earn five types of resources:
- **Money**: Primary currency for construction and training
- **Steel**: Raw material for weapons and structures
- **Oil**: Fuel for military vehicles
- **Electronics**: Component for advanced technology
- **Manpower**: Labor for training troops

### Units
- **Infantry**: Basic ground troops, balanced cost/power
- **Vehicles**: Heavy armor, higher attack power
- **Air Force**: Fast, good for reconnaissance
- **Naval**: Control water, defend coastlines

### Research
Technology tree includes:
- Advanced Armor
- Weapon Systems
- Engine Technology
- Radar Systems
- Shield Technology

### Combat
When two forces clash:
1. Calculate total combat power (unit stats × health × level)
2. Determine casualties based on power difference
3. Award experience to victorious player
4. Update leaderboards

### Alliances
- Create or join factions
- Coordinate attacks with allies
- Share intel and strategy
- Compete as a unified force

## API Endpoints

### Authentication
- `POST /api/auth` - Login/Register player
- `GET /api/auth?playerId=...` - Get player data

### Game Data
- `GET /api/player` - Current player info
- `GET /api/bases?playerId=...` - Player bases
- `GET /api/units?baseId=...` - Base units
- `GET /api/leaderboard` - Global rankings
- `GET /api/missions?playerId=...` - Active missions

### Actions
- `POST /api/bases` - Create new base
- `POST /api/units` - Train units
- `POST /api/research` - Research technology
- `POST /api/attack` - Launch attack
- `POST /api/alliances` - Alliance actions

## Gameplay Tips

1. **Early Game**: Focus on building your first base and training basic units
2. **Resource Management**: Balance spending on units vs. upgrades
3. **Research Strategy**: Prioritize technologies that benefit your playstyle
4. **Alliances**: Join an alliance early for protection and shared growth
5. **Attacks**: Scout enemy bases before committing forces
6. **Defense**: Keep units stationed at your most valuable bases

## Deployment

### Deploy to Vercel
```bash
npm run build
vercel deploy
```

The application is Vercel-optimized and includes:
- Server-side rendering with App Router
- Optimized API routes
- Static generation where possible
- Edge middleware support

### Environment Variables for Production
- `DATABASE_URL` - PostgreSQL connection string
- Add any third-party API keys as needed

## Future Enhancements

- **PlayCanvas 3D Graphics**: Full 3D visualization of battles and bases
- **Real-Time Updates**: WebSocket integration for live events
- **Advanced Matchmaking**: ELO-based ranking system
- **Tournaments**: Seasonal competitive events
- **Mobile App**: React Native companion app
- **Trading System**: Player-to-player resource trading
- **Achievements**: Badges and permanent unlocks
- **Map Expansion**: Procedurally generated territories

## Development

### Adding New Features

1. Create database migration in `scripts/`
2. Update types in `lib/types/game.ts`
3. Add API route in `app/api/`
4. Create React component in `components/`
5. Integrate into game page

### Code Standards
- Use TypeScript for type safety
- Follow React best practices
- Use semantic HTML
- Implement accessibility (ARIA labels)
- Keep components focused and reusable

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check Neon connection limits
- Ensure IP is whitelisted if using Neon

### Game Page Won't Load
- Check browser console for errors
- Verify all API endpoints are working
- Clear localStorage and reload

### Missing Data After Restart
- All data persists in PostgreSQL
- Check database for table contents
- Verify player ID in localStorage

## Contributing

This is a single-player created project for the Zerx universe. To extend it:
1. Fork or clone the repository
2. Create a feature branch
3. Make your improvements
4. Test thoroughly
5. Submit changes

## License

Zerx is provided as-is for educational and entertainment purposes.

## Support

For issues or questions:
- Check the troubleshooting section
- Review API route implementations
- Test database connectivity
- Inspect browser dev tools for client errors

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Built with**: Next.js 16, React 19, Tailwind CSS, PostgreSQL
