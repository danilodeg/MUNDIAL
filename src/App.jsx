import React, { useState } from 'react';
import { Trophy, Shuffle, Play, RefreshCw, Shield, Award, Medal, Globe } from 'lucide-react';

// --- DATA & CONFIGURATION ---

// Helper para obtener URL de banderas (usando flagcdn)
const getFlag = (iso) => iso ? `https://flagcdn.com/w40/${iso}.png` : null;

// Rankings FIFA actualizados (Nov/Dec 2025 - Estimado) + Códigos ISO
const TEAM_DATA = {
  // CLASIFICADOS DIRECTOS
  'México': { rank: 15, iso: 'mx' }, 'Sudáfrica': { rank: 61, iso: 'za' }, 'República de Corea': { rank: 22, iso: 'kr' },
  'Canadá': { rank: 27, iso: 'ca' }, 'Catar': { rank: 51, iso: 'qa' }, 'Suiza': { rank: 17, iso: 'ch' },
  'Brasil': { rank: 5, iso: 'br' }, 'Marruecos': { rank: 11, iso: 'ma' }, 'Haití': { rank: 84, iso: 'ht' }, 'Escocia': { rank: 36, iso: 'gb-sct' },
  'Estados Unidos': { rank: 14, iso: 'us' }, 'Paraguay': { rank: 39, iso: 'py' }, 'Australia': { rank: 26, iso: 'au' },
  'Alemania': { rank: 9, iso: 'de' }, 'Curazao': { rank: 82, iso: 'cw' }, 'Costa de Marfil': { rank: 42, iso: 'ci' }, 'Ecuador': { rank: 23, iso: 'ec' },
  'Países Bajos': { rank: 7, iso: 'nl' }, 'Japón': { rank: 18, iso: 'jp' }, 'Túnez': { rank: 40, iso: 'tn' },
  'Bélgica': { rank: 8, iso: 'be' }, 'Egipto': { rank: 34, iso: 'eg' }, 'Irán': { rank: 20, iso: 'ir' }, 'Nueva Zelanda': { rank: 86, iso: 'nz' },
  'España': { rank: 1, iso: 'es' }, 'Cabo Verde': { rank: 68, iso: 'cv' }, 'Arabia Saudí': { rank: 60, iso: 'sa' }, 'Uruguay': { rank: 16, iso: 'uy' },
  'Francia': { rank: 3, iso: 'fr' }, 'Senegal': { rank: 19, iso: 'sn' }, 'Noruega': { rank: 29, iso: 'no' },
  'Argentina': { rank: 2, iso: 'ar' }, 'Argelia': { rank: 35, iso: 'dz' }, 'Austria': { rank: 24, iso: 'at' }, 'Jordania': { rank: 66, iso: 'jo' },
  'Portugal': { rank: 6, iso: 'pt' }, 'Uzbekistán': { rank: 50, iso: 'uz' }, 'Colombia': { rank: 13, iso: 'co' },
  'Inglaterra': { rank: 4, iso: 'gb-eng' }, 'Croacia': { rank: 10, iso: 'hr' }, 'Ghana': { rank: 72, iso: 'gh' }, 'Panamá': { rank: 30, iso: 'pa' },

  // EQUIPOS DE REPECHAJE
  // UEFA A
  'Italia': { rank: 9, iso: 'it' }, 'Gales': { rank: 32, iso: 'gb-wls' }, 'Bosnia': { rank: 75, iso: 'ba' }, 'Irlanda del Norte': { rank: 69, iso: 'gb-nir' },
  // UEFA B
  'Ucrania': { rank: 27, iso: 'ua' }, 'Polonia': { rank: 33, iso: 'pl' }, 'Suecia': { rank: 43, iso: 'se' }, 'Albania': { rank: 63, iso: 'al' },
  // UEFA C
  'Turquía': { rank: 26, iso: 'tr' }, 'Eslovaquia': { rank: 46, iso: 'sk' }, 'Rumania': { rank: 47, iso: 'ro' }, 'Kosovo': { rank: 84, iso: 'xk' },
  // UEFA D
  'Dinamarca': { rank: 21, iso: 'dk' }, 'Rep. Checa': { rank: 44, iso: 'cz' }, 'Irlanda': { rank: 62, iso: 'ie' }, 'Macedonia del Norte': { rank: 65, iso: 'mk' },
  // INTERCONTINENTAL A
  'RD Congo': { rank: 56, iso: 'cd' }, 'Jamaica': { rank: 70, iso: 'jm' }, 'Nueva Caledonia': { rank: 149, iso: 'nc' },
  // INTERCONTINENTAL B
  'Irak': { rank: 58, iso: 'iq' }, 'Bolivia': { rank: 76, iso: 'bo' }, 'Surinam': { rank: 123, iso: 'sr' }
};

const PLAYOFF_STRUCTURE = {
    uefa_a: { name: 'UEFA Playoff A', type: 'bracket', teams: ['Italia', 'Irlanda del Norte', 'Gales', 'Bosnia'] }, 
    uefa_b: { name: 'UEFA Playoff B', type: 'bracket', teams: ['Ucrania', 'Albania', 'Polonia', 'Suecia'] },
    uefa_c: { name: 'UEFA Playoff C', type: 'bracket', teams: ['Turquía', 'Kosovo', 'Rumania', 'Eslovaquia'] }, 
    uefa_d: { name: 'UEFA Playoff D', type: 'bracket', teams: ['Dinamarca', 'Macedonia del Norte', 'Rep. Checa', 'Irlanda'] },
    inter_a: { name: 'Repechaje Inter. A', type: 'ladder', teams: ['RD Congo', 'Jamaica', 'Nueva Caledonia'] }, 
    inter_b: { name: 'Repechaje Inter. B', type: 'ladder', teams: ['Irak', 'Bolivia', 'Surinam'] }
};

const MODES = {
  RANK: 'ranking',   
  SURPRISE: 'surprise', 
  RANDOM: 'random', 
};

// --- LOGIC HELPERS ---

const simulateMatch = (teamA, teamB, mode, cantDraw = false) => {
  const rankA = TEAM_DATA[teamA]?.rank || 50;
  const rankB = TEAM_DATA[teamB]?.rank || 50;
  
  let probA = 0.5;

  if (mode === MODES.RANK) {
    probA = rankA < rankB ? 1 : 0;
  } else if (mode === MODES.SURPRISE) {
    const diff = rankB - rankA; 
    probA = 0.5 + (diff / 150); 
    probA = Math.max(0.15, Math.min(0.85, probA));
  }

  let scoreA = 0, scoreB = 0;
  const rand = Math.random();

  if (rand < probA) {
    scoreA = Math.floor(Math.random() * 3) + 1; 
    scoreB = Math.floor(Math.random() * scoreA);
  } else if (!cantDraw && rand > probA + (mode === MODES.RANK ? 0 : 0.05)) {
    const goals = Math.floor(Math.random() * 3);
    scoreA = goals; scoreB = goals;
  } else {
    scoreB = Math.floor(Math.random() * 3) + 1;
    scoreA = Math.floor(Math.random() * scoreB);
  }

  if (cantDraw && scoreA === scoreB) {
      if(mode === MODES.RANK) {
          if(rankA < rankB) scoreA++; else scoreB++;
      } else {
          if(Math.random() > 0.5) scoreA++; else scoreB++;
      }
  }

  if (mode === MODES.RANK) {
     if (rankA < rankB) { scoreA=Math.max(scoreA, scoreB+1); scoreB=Math.min(scoreB, scoreA-1); }
     else { scoreB=Math.max(scoreB, scoreA+1); scoreA=Math.min(scoreA, scoreB-1); }
  }

  return { 
      team1: teamA, team2: teamB, 
      score1: scoreA, score2: scoreB, 
      winner: scoreA > scoreB ? teamA : teamB 
  };
};

// --- COMPONENTS ---

const TeamWithFlag = ({ name, className }) => {
    const iso = TEAM_DATA[name]?.iso;
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {iso && <img src={getFlag(iso)} alt={name} className="w-5 h-3.5 shadow-sm object-cover rounded-[1px]" />}
            <span className="truncate">{name}</span>
        </div>
    );
};

const MatchMini = ({ match }) => (
    <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
        <div className={`flex-1 ${match.winner === match.team1 ? "font-bold text-slate-800" : "text-slate-500"}`}>
            <TeamWithFlag name={match.team1} />
        </div>
        <div className="bg-slate-100 px-1 rounded text-slate-700 font-mono mx-2">{match.score1}-{match.score2}</div>
        <div className={`flex-1 flex justify-end ${match.winner === match.team2 ? "font-bold text-slate-800" : "text-slate-500"}`}>
            <TeamWithFlag name={match.team2} className="flex-row-reverse" />
        </div>
    </div>
);

const MatchCard = ({ match, isFinal }) => {
  if (!match) return null;
  return (
    <div className={`bg-white p-3 rounded-lg border ${isFinal ? 'border-yellow-400 shadow-md ring-1 ring-yellow-100' : 'border-slate-200 shadow-sm'} mb-2 flex flex-col justify-center min-w-[200px]`}>
      <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-2 tracking-wider">
         <span>#{match.id}</span>
         <span className="uppercase">{match.stadium}</span>
      </div>
      <div className="flex justify-between items-center mb-1">
        <div className={`flex items-center gap-2 text-sm font-medium ${match.winner === match.team1 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
            <TeamWithFlag name={match.team1} />
        </div>
        <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-bold text-slate-800">{match.score1}</span>
      </div>
      <div className="flex justify-between items-center">
        <div className={`flex items-center gap-2 text-sm font-medium ${match.winner === match.team2 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
            <TeamWithFlag name={match.team2} />
        </div>
        <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-bold text-slate-800">{match.score2}</span>
      </div>
    </div>
  );
};

const GroupCard = ({ group, standings }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 px-4 py-2 text-white font-bold flex justify-between items-center">
        <span>Grupo {group.name}</span>
      </div>
      <div className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-3 py-2">Equipo</th>
              <th className="px-2 py-2 text-center">PTS</th>
              <th className="px-2 py-2 text-center">DIF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((team, idx) => (
              <tr key={team.name} className={idx < 2 ? "bg-green-50/50" : (idx === 2 ? "bg-amber-50/30" : "")}>
                <td className="px-3 py-2 font-medium text-slate-700">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                     <TeamWithFlag name={team.name} />
                   </div>
                </td>
                <td className="px-2 py-2 text-center font-bold text-slate-800">{team.points}</td>
                <td className="px-2 py-2 text-center text-slate-500">{team.gf - team.ga}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

export default function App() {
  const [simMode, setSimMode] = useState(MODES.RANK);
  const [simulation, setSimulation] = useState(null);
  const [activeTab, setActiveTab] = useState('playoffs');

  const runSimulation = () => {
    // 0. SIMULATE PLAYOFFS
    let playoffResults = {};
    let qualifiedTeams = {}; 

    const runUefaBracket = (key, teams) => {
        const semi1 = simulateMatch(teams[0], teams[3], simMode, true);
        const semi2 = simulateMatch(teams[1], teams[2], simMode, true);
        const final = simulateMatch(semi1.winner, semi2.winner, simMode, true);
        playoffResults[key] = { name: PLAYOFF_STRUCTURE[key].name, matches: [semi1, semi2, final], winner: final.winner };
        return final.winner;
    };

    const runInterLadder = (key, teams) => {
        const semi = simulateMatch(teams[1], teams[2], simMode, true);
        const final = simulateMatch(teams[0], semi.winner, simMode, true);
        playoffResults[key] = { name: PLAYOFF_STRUCTURE[key].name, matches: [semi, final], winner: final.winner };
        return final.winner;
    };

    qualifiedTeams['uefa_a'] = runUefaBracket('uefa_a', PLAYOFF_STRUCTURE.uefa_a.teams);
    qualifiedTeams['uefa_b'] = runUefaBracket('uefa_b', PLAYOFF_STRUCTURE.uefa_b.teams);
    qualifiedTeams['uefa_c'] = runUefaBracket('uefa_c', PLAYOFF_STRUCTURE.uefa_c.teams);
    qualifiedTeams['uefa_d'] = runUefaBracket('uefa_d', PLAYOFF_STRUCTURE.uefa_d.teams);
    qualifiedTeams['inter_a'] = runInterLadder('inter_a', PLAYOFF_STRUCTURE.inter_a.teams);
    qualifiedTeams['inter_b'] = runInterLadder('inter_b', PLAYOFF_STRUCTURE.inter_b.teams);

    // 1. CONSTRUCT GROUPS
    const GROUPS = [
        { name: 'A', teams: ['México', 'Sudáfrica', 'República de Corea', qualifiedTeams['uefa_d']] },
        { name: 'B', teams: ['Canadá', qualifiedTeams['uefa_a'], 'Catar', 'Suiza'] },
        { name: 'C', teams: ['Brasil', 'Marruecos', 'Haití', 'Escocia'] },
        { name: 'D', teams: ['Estados Unidos', 'Paraguay', 'Australia', qualifiedTeams['uefa_c']] },
        { name: 'E', teams: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'] },
        { name: 'F', teams: ['Países Bajos', 'Japón', qualifiedTeams['uefa_b'], 'Túnez'] },
        { name: 'G', teams: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'] },
        { name: 'H', teams: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay'] },
        { name: 'I', teams: ['Francia', 'Senegal', qualifiedTeams['inter_a'], 'Noruega'] },
        { name: 'J', teams: ['Argentina', 'Argelia', 'Austria', 'Jordania'] },
        { name: 'K', teams: ['Portugal', qualifiedTeams['inter_b'], 'Uzbekistán', 'Colombia'] },
        { name: 'L', teams: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'] },
    ];

    // 2. GROUP STAGE SIM
    let groupResults = {};
    GROUPS.forEach(g => {
      groupResults[g.name] = g.teams.map(t => ({
        name: t, points: 0, gf: 0, ga: 0, wins: 0, draws: 0, losses: 0, group: g.name
      }));
    });

    GROUPS.forEach(g => {
      const teams = g.teams;
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const t1 = teams[i]; const t2 = teams[j];
          const result = simulateMatch(t1, t2, simMode, false);
          
          const stats1 = groupResults[g.name].find(t => t.name === t1);
          const stats2 = groupResults[g.name].find(t => t.name === t2);

          stats1.gf += result.score1; stats1.ga += result.score2;
          stats2.gf += result.score2; stats2.ga += result.score1;

          if (result.score1 > result.score2) { stats1.points += 3; stats1.wins++; stats2.losses++; }
          else if (result.score2 > result.score1) { stats2.points += 3; stats2.wins++; stats1.losses++; }
          else { stats1.points += 1; stats2.points += 1; stats1.draws++; stats2.draws++; }
        }
      }
      groupResults[g.name].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return (b.gf - b.ga) - (a.gf - a.ga);
      });
    });

    // 3. QUALIFIERS LOGIC
    const getPos = (groupName, pos) => groupResults[groupName][pos - 1].name;
    let thirdPlaces = [];
    GROUPS.forEach(g => thirdPlaces.push({ ...groupResults[g.name][2], group: g.name }));
    thirdPlaces.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return (b.gf - b.ga) - (a.gf - a.ga);
    });
    const best8Thirds = thirdPlaces.slice(0, 8);
    
    let usedThirds = [];
    const get3rd = (allowedGroups, usedTeams) => {
        const allowed = allowedGroups.split('');
        let candidate = best8Thirds.find(t => allowed.includes(t.group) && !usedTeams.includes(t.name));
        if (!candidate) candidate = best8Thirds.find(t => !usedTeams.includes(t.name));
        if (candidate) { usedTeams.push(candidate.name); return candidate.name; }
        return "TBD"; 
    };

    // 4. FINAL STAGE FIXTURE
    const r32Defs = [
        { id: 73, t1: getPos('A', 2), t2: getPos('B', 2), stadium: 'LA Stadium' },
        { id: 74, t1: getPos('E', 1), t2: get3rd('ABCD F', usedThirds), stadium: 'Boston' },
        { id: 75, t1: getPos('F', 1), t2: getPos('C', 2), stadium: 'Monterrey' },
        { id: 76, t1: getPos('C', 1), t2: getPos('F', 2), stadium: 'Houston' },
        { id: 77, t1: getPos('I', 1), t2: get3rd('CD FGH', usedThirds), stadium: 'NY/NJ' },
        { id: 78, t1: getPos('E', 2), t2: getPos('I', 2), stadium: 'Dallas' },
        { id: 79, t1: getPos('A', 1), t2: get3rd('C E FHI', usedThirds), stadium: 'CDMX' },
        { id: 80, t1: getPos('L', 1), t2: get3rd('EHIJK', usedThirds), stadium: 'Atlanta' },
        { id: 81, t1: getPos('D', 1), t2: get3rd('BEFIJ', usedThirds), stadium: 'SF Bay Area' },
        { id: 82, t1: getPos('G', 1), t2: get3rd('AEHIJ', usedThirds), stadium: 'Seattle' },
        { id: 83, t1: getPos('K', 2), t2: getPos('L', 2), stadium: 'Toronto' },
        { id: 84, t1: getPos('H', 1), t2: getPos('J', 2), stadium: 'LA Stadium' },
        { id: 85, t1: getPos('B', 1), t2: get3rd('EFGIJ', usedThirds), stadium: 'Vancouver' },
        { id: 86, t1: getPos('J', 1), t2: getPos('H', 2), stadium: 'Miami' },
        { id: 87, t1: getPos('K', 1), t2: get3rd('DEIJL', usedThirds), stadium: 'Kansas City' },
        { id: 88, t1: getPos('D', 2), t2: getPos('G', 2), stadium: 'Dallas' }
    ];

    let r32Matches = r32Defs.map(d => {
        const res = simulateMatch(d.t1, d.t2, simMode, true);
        return { ...d, team1: d.t1, team2: d.t2, score1: res.score1, score2: res.score2, winner: res.winner };
    });

    const getW = (id) => r32Matches.find(m => m.id === id).winner;

    const r16Defs = [
        { id: 89, t1: getW(74), t2: getW(77), stadium: 'Philadelphia' },
        { id: 90, t1: getW(73), t2: getW(75), stadium: 'Houston' },
        { id: 91, t1: getW(76), t2: getW(78), stadium: 'NY/NJ' },
        { id: 92, t1: getW(79), t2: getW(80), stadium: 'Azteca' },
        { id: 93, t1: getW(83), t2: getW(84), stadium: 'Dallas' },
        { id: 94, t1: getW(81), t2: getW(82), stadium: 'Seattle' },
        { id: 95, t1: getW(86), t2: getW(88), stadium: 'Atlanta' },
        { id: 96, t1: getW(85), t2: getW(87), stadium: 'Vancouver' }
    ];

    let r16Matches = r16Defs.map(d => {
        const res = simulateMatch(d.t1, d.t2, simMode, true);
        return { ...d, team1: d.t1, team2: d.t2, score1: res.score1, score2: res.score2, winner: res.winner };
    });
    const getW16 = (id) => r16Matches.find(m => m.id === id).winner;

    const qfDefs = [
        { id: 97, t1: getW16(89), t2: getW16(90), stadium: 'Boston' },
        { id: 98, t1: getW16(93), t2: getW16(94), stadium: 'LA Stadium' },
        { id: 99, t1: getW16(91), t2: getW16(92), stadium: 'Miami' },
        { id: 100, t1: getW16(95), t2: getW16(96), stadium: 'Kansas City' },
    ];
    let qfMatches = qfDefs.map(d => {
        const res = simulateMatch(d.t1, d.t2, simMode, true);
        return { ...d, team1: d.t1, team2: d.t2, score1: res.score1, score2: res.score2, winner: res.winner };
    });
    const getWQF = (id) => qfMatches.find(m => m.id === id).winner;

    const sfDefs = [
        { id: 101, t1: getWQF(97), t2: getWQF(98), stadium: 'Dallas' },
        { id: 102, t1: getWQF(99), t2: getWQF(100), stadium: 'Atlanta' },
    ];
    let sfMatches = sfDefs.map(d => {
        const res = simulateMatch(d.t1, d.t2, simMode, true);
        return { ...d, team1: d.t1, team2: d.t2, score1: res.score1, score2: res.score2, winner: res.winner, loser: res.winner === d.t1 ? d.t2 : d.t1 };
    });
    const getWSF = (id) => sfMatches.find(m => m.id === id).winner;
    const getLSF = (id) => sfMatches.find(m => m.id === id).loser;

    const thirdMatchRes = simulateMatch(getLSF(101), getLSF(102), simMode, true);
    const thirdMatch = { id: 103, stage: '3er Puesto', stadium: 'Miami', team1: getLSF(101), team2: getLSF(102), score1: thirdMatchRes.score1, score2: thirdMatchRes.score2, winner: thirdMatchRes.winner };

    const finalMatchRes = simulateMatch(getWSF(101), getWSF(102), simMode, true);
    const finalMatch = { id: 104, stage: 'FINAL', stadium: 'NY/NJ', team1: getWSF(101), team2: getWSF(102), score1: finalMatchRes.score1, score2: finalMatchRes.score2, winner: finalMatchRes.winner };

    setSimulation({
      playoffs: playoffResults,
      groups: groupResults,
      bracket: { r32: r32Matches, r16: r16Matches, qf: qfMatches, sf: sfMatches, third: thirdMatch, final: finalMatch }
    });
    setActiveTab('playoffs');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Mundial 2026 Simulator</h1>
                <p className="text-emerald-200 text-sm">48 Equipos | Simulación Completa (Playoffs Incluidos)</p>
              </div>
            </div>
            <div className="flex bg-emerald-900/50 p-1 rounded-lg backdrop-blur-sm">
               <button onClick={() => setSimMode(MODES.RANK)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${simMode === MODES.RANK ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}><Shield className="w-4 h-4 inline mr-2" />Ranking</button>
               <button onClick={() => setSimMode(MODES.SURPRISE)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${simMode === MODES.SURPRISE ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}><Shuffle className="w-4 h-4 inline mr-2" />Sorpresas</button>
               <button onClick={() => setSimMode(MODES.RANDOM)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${simMode === MODES.RANDOM ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}><RefreshCw className="w-4 h-4 inline mr-2" />Aleatorio</button>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button onClick={runSimulation} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"><Play className="w-5 h-5" fill="currentColor" />{simulation ? 'Reiniciar Simulación' : 'Comenzar Torneo'}</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {!simulation && (
          <div className="text-center py-20 text-slate-400">
            <Trophy className="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p className="text-xl">Selecciona un modo y presiona "Comenzar Torneo"</p>
          </div>
        )}

        {simulation && (
          <>
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
              <button onClick={() => setActiveTab('playoffs')} className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'playoffs' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Repechajes y Clasificación</button>
              <button onClick={() => setActiveTab('groups')} className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'groups' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Fase de Grupos</button>
              <button onClick={() => setActiveTab('bracket')} className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'bracket' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Fase Final</button>
            </div>

            {activeTab === 'playoffs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {Object.values(simulation.playoffs).map((p, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-600"/> {p.name}</h3>
                            <div className="space-y-2 mb-3">
                                {p.matches.map((m, midx) => <MatchMini key={midx} match={m} />)}
                            </div>
                            <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-center text-sm font-bold border border-emerald-100 flex justify-center items-center gap-2">
                                <span>Clasificado:</span>
                                <TeamWithFlag name={p.winner} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'groups' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                {simulation.groups && Object.keys(simulation.groups).map(g => (
                  <GroupCard key={g} group={{name: g}} standings={simulation.groups[g]} />
                ))}
              </div>
            )}

            {activeTab === 'bracket' && (
              <div className="space-y-12 animate-fadeIn pb-20">
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-2xl p-8 text-center shadow-sm">
                  <h2 className="text-amber-800 text-sm font-bold uppercase tracking-widest mb-2">Campeón del Mundo 2026</h2>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Award className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
                    <div className="text-4xl md:text-6xl font-black text-slate-900 flex items-center gap-4">
                       <TeamWithFlag name={simulation.bracket.final.winner} className="text-4xl md:text-6xl" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="flex flex-col items-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500"/> La Gran Final</h3>
                        <div className="w-full max-w-md"><MatchCard match={simulation.bracket.final} isFinal={true} /></div>
                    </div>
                     <div className="flex flex-col items-center">
                        <h3 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2"><Medal className="w-6 h-6 text-amber-600"/> Tercer Puesto</h3>
                        <div className="w-full max-w-md"><MatchCard match={simulation.bracket.third} /></div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-600 mb-4 border-l-4 border-emerald-500 pl-3">Semifinales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {simulation.bracket.sf.map(m => <MatchCard key={m.id} match={m} />)}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-600 mb-4 border-l-4 border-emerald-500 pl-3">Cuartos de Final</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {simulation.bracket.qf.map(m => <MatchCard key={m.id} match={m} />)}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-600 mb-4 border-l-4 border-emerald-500 pl-3">Octavos de Final</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {simulation.bracket.r16.map(m => <MatchCard key={m.id} match={m} />)}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-600 mb-4 border-l-4 border-emerald-500 pl-3">16vos de Final (Ronda de 32)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {simulation.bracket.r32.map(m => <MatchCard key={m.id} match={m} />)}
                    </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
