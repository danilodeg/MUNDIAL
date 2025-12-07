import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Shuffle, Play, RefreshCw, Shield, Award, Medal, Globe, Download, MousePointerClick, CheckCircle2, Pencil, ChevronUp, ChevronDown, X, ArrowRight } from 'lucide-react';

// --- DATA & CONFIGURATION ---

const getFlag = (iso) => iso ? `https://flagcdn.com/w40/${iso}.png` : null;

// Helper para detectar qué equipos son fijos y cuáles vienen de repechaje
const IS_FIXED_TEAM = (teamName) => {
    const fixed = [
        'México', 'Sudáfrica', 'República de Corea',
        'Canadá', 'Catar', 'Suiza',
        'Brasil', 'Marruecos', 'Haití', 'Escocia',
        'Estados Unidos', 'Paraguay', 'Australia',
        'Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador',
        'Países Bajos', 'Japón', 'Túnez',
        'Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda',
        'España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay',
        'Francia', 'Senegal', 'Noruega',
        'Argentina', 'Argelia', 'Austria', 'Jordania',
        'Portugal', 'Uzbekistán', 'Colombia',
        'Inglaterra', 'Croacia', 'Ghana', 'Panamá'
    ];
    return fixed.includes(teamName);
};

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
  'Italia': { rank: 9, iso: 'it' }, 'Gales': { rank: 32, iso: 'gb-wls' }, 'Bosnia': { rank: 75, iso: 'ba' }, 'Irlanda del Norte': { rank: 69, iso: 'gb-nir' },
  'Ucrania': { rank: 27, iso: 'ua' }, 'Polonia': { rank: 33, iso: 'pl' }, 'Suecia': { rank: 43, iso: 'se' }, 'Albania': { rank: 63, iso: 'al' },
  'Turquía': { rank: 26, iso: 'tr' }, 'Eslovaquia': { rank: 46, iso: 'sk' }, 'Rumania': { rank: 47, iso: 'ro' }, 'Kosovo': { rank: 84, iso: 'xk' },
  'Dinamarca': { rank: 21, iso: 'dk' }, 'Rep. Checa': { rank: 44, iso: 'cz' }, 'Irlanda': { rank: 62, iso: 'ie' }, 'Macedonia del Norte': { rank: 65, iso: 'mk' },
  'RD Congo': { rank: 56, iso: 'cd' }, 'Jamaica': { rank: 70, iso: 'jm' }, 'Nueva Caledonia': { rank: 149, iso: 'nc' },
  'Irak': { rank: 58, iso: 'iq' }, 'Bolivia': { rank: 76, iso: 'bo' }, 'Surinam': { rank: 123, iso: 'sr' }
};

const PLAYOFF_STRUCTURE = {
    uefa_a: { name: 'UEFA Playoff A', type: 'bracket', teams: ['Italia', 'Irlanda del Norte', 'Gales', 'Bosnia'], targetGroup: 'B' }, 
    uefa_b: { name: 'UEFA Playoff B', type: 'bracket', teams: ['Ucrania', 'Albania', 'Polonia', 'Suecia'], targetGroup: 'F' },
    uefa_c: { name: 'UEFA Playoff C', type: 'bracket', teams: ['Turquía', 'Kosovo', 'Rumania', 'Eslovaquia'], targetGroup: 'D' }, 
    uefa_d: { name: 'UEFA Playoff D', type: 'bracket', teams: ['Dinamarca', 'Macedonia del Norte', 'Rep. Checa', 'Irlanda'], targetGroup: 'A' },
    inter_a: { name: 'Repechaje Inter. A', type: 'ladder', teams: ['RD Congo', 'Jamaica', 'Nueva Caledonia'], targetGroup: 'I' }, 
    inter_b: { name: 'Repechaje Inter. B', type: 'ladder', teams: ['Irak', 'Bolivia', 'Surinam'], targetGroup: 'K' }
};

const INITIAL_GROUPS_DEF = [
    { name: 'A', teams: ['México', 'Sudáfrica', 'República de Corea', 'Ganador UEFA Playoff D'] },
    { name: 'B', teams: ['Canadá', 'Ganador UEFA Playoff A', 'Catar', 'Suiza'] },
    { name: 'C', teams: ['Brasil', 'Marruecos', 'Haití', 'Escocia'] },
    { name: 'D', teams: ['Estados Unidos', 'Paraguay', 'Australia', 'Ganador UEFA Playoff C'] },
    { name: 'E', teams: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'] },
    { name: 'F', teams: ['Países Bajos', 'Japón', 'Ganador UEFA Playoff B', 'Túnez'] },
    { name: 'G', teams: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'] },
    { name: 'H', teams: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay'] },
    { name: 'I', teams: ['Francia', 'Senegal', 'Ganador Repechaje Inter. A', 'Noruega'] },
    { name: 'J', teams: ['Argentina', 'Argelia', 'Austria', 'Jordania'] },
    { name: 'K', teams: ['Portugal', 'Ganador Repechaje Inter. B', 'Uzbekistán', 'Colombia'] },
    { name: 'L', teams: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'] },
];

const MODES = { RANK: 'ranking', SURPRISE: 'surprise', RANDOM: 'random', MANUAL: 'manual' };

const NEXT_MATCH_MAP = {
    73: { next: 90, slot: 'team1' }, 75: { next: 90, slot: 'team2' },
    74: { next: 89, slot: 'team1' }, 77: { next: 89, slot: 'team2' },
    76: { next: 91, slot: 'team1' }, 78: { next: 91, slot: 'team2' },
    79: { next: 92, slot: 'team1' }, 80: { next: 92, slot: 'team2' },
    81: { next: 94, slot: 'team1' }, 82: { next: 94, slot: 'team2' },
    83: { next: 93, slot: 'team1' }, 84: { next: 93, slot: 'team2' },
    85: { next: 96, slot: 'team1' }, 87: { next: 96, slot: 'team2' },
    86: { next: 95, slot: 'team1' }, 88: { next: 95, slot: 'team2' },
    89: { next: 97, slot: 'team1' }, 90: { next: 97, slot: 'team2' },
    91: { next: 99, slot: 'team1' }, 92: { next: 99, slot: 'team2' },
    93: { next: 98, slot: 'team1' }, 94: { next: 98, slot: 'team2' },
    95: { next: 100, slot: 'team1' }, 96: { next: 100, slot: 'team2' },
    97: { next: 101, slot: 'team1' }, 98: { next: 101, slot: 'team2' },
    99: { next: 102, slot: 'team1' }, 100: { next: 102, slot: 'team2' },
    101: { next: 104, slot: 'team1', loserNext: 103, loserSlot: 'team1' },
    102: { next: 104, slot: 'team2', loserNext: 103, loserSlot: 'team2' },
};

// --- LOGIC HELPERS ---

const simulateMatch = (teamA, teamB, mode, cantDraw = false) => {
  if (!teamA || !teamB) return { team1: teamA, team2: teamB, score1: '', score2: '', winner: null };
  const rankA = TEAM_DATA[teamA]?.rank || 50;
  const rankB = TEAM_DATA[teamB]?.rank || 50;
  const effectiveMode = mode === MODES.MANUAL ? MODES.RANK : mode;
  let probA = 0.5;
  if (effectiveMode === MODES.RANK) probA = rankA < rankB ? 1 : 0;
  else if (effectiveMode === MODES.SURPRISE) probA = Math.max(0.15, Math.min(0.85, 0.5 + ((rankB - rankA) / 150)));
  
  let scoreA = 0, scoreB = 0;
  const rand = Math.random();
  if (rand < probA) { scoreA = Math.floor(Math.random() * 3) + 1; scoreB = Math.floor(Math.random() * scoreA); } 
  else if (!cantDraw && rand > probA + (effectiveMode === MODES.RANK ? 0 : 0.05)) { const g = Math.floor(Math.random() * 3); scoreA = g; scoreB = g; } 
  else { scoreB = Math.floor(Math.random() * 3) + 1; scoreA = Math.floor(Math.random() * scoreB); }
  
  if (cantDraw && scoreA === scoreB) {
      if(effectiveMode === MODES.RANK) (rankA < rankB) ? scoreA++ : scoreB++;
      else (Math.random() > 0.5) ? scoreA++ : scoreB++;
  }
  
  if (effectiveMode === MODES.RANK) {
     if (rankA < rankB) { scoreA=Math.max(scoreA, scoreB+1); scoreB=Math.min(scoreB, scoreA-1); }
     else { scoreB=Math.max(scoreB, scoreA+1); scoreA=Math.min(scoreA, scoreB-1); }
  }
  return { team1: teamA, team2: teamB, score1: scoreA, score2: scoreB, winner: scoreA > scoreB ? teamA : teamB };
};

const TeamWithFlag = ({ name, className, big }) => {
    const iso = TEAM_DATA[name]?.iso;
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {iso && <img src={getFlag(iso)} alt={name} className={`${big ? 'w-8 h-6' : 'w-5 h-3.5'} shadow-sm object-cover rounded-[1px]`} />}
            <span className={`truncate ${big ? 'text-lg' : ''}`}>{name || (big ? 'A definir' : 'TBD')}</span>
        </div>
    );
};

const MatchMini = ({ match, onPick, isManual }) => {
    return (
        <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
            <div 
                className={`flex-1 flex items-center gap-2 p-1 rounded ${isManual ? "cursor-pointer hover:bg-slate-50" : ""} ${match.winner === match.team1 ? "font-bold text-slate-900 bg-emerald-50" : "text-slate-500"}`}
                onClick={() => isManual && onPick && onPick(match.id, match.team1)}
            >
                <TeamWithFlag name={match.team1} />
            </div>
            <div className="bg-slate-100 px-1 rounded text-slate-700 font-mono mx-2 min-w-[30px] text-center">
                {match.score1}-{match.score2}
            </div>
            <div 
                className={`flex-1 flex justify-end items-center gap-2 p-1 rounded ${isManual ? "cursor-pointer hover:bg-slate-50" : ""} ${match.winner === match.team2 ? "font-bold text-slate-900 bg-emerald-50" : "text-slate-500"}`}
                onClick={() => isManual && onPick && onPick(match.id, match.team2)}
            >
                <TeamWithFlag name={match.team2} className="flex-row-reverse" />
            </div>
        </div>
    );
};

const InteractiveMatchCard = ({ match, isFinal, onPick, onSelectTeam, isManual, selectedTeams = [] }) => {
  if (!match) return null;
  const showSelector1 = isManual && match.source1 && !match.team1;
  const showSelector2 = isManual && match.source2 && !match.team2;
  const canPickWinner = isManual && match.team1 && match.team2 && !match.winner;

  return (
    <div className={`relative bg-white p-3 rounded-lg border transition-all duration-200
        ${isFinal ? 'border-yellow-400 shadow-md ring-1 ring-yellow-100' : 'border-slate-200 shadow-sm'} 
        ${isManual && (!match.team1 || !match.team2) ? 'ring-2 ring-blue-100' : ''}
        ${isManual && canPickWinner ? 'ring-2 ring-emerald-400 shadow-md cursor-pointer' : ''}
        mb-2 flex flex-col justify-center min-w-[200px]`}>
      
      <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-2 tracking-wider">
         <span>#{match.id}</span>
         <span className="uppercase truncate max-w-[120px]">{match.stadium}</span>
      </div>

      {showSelector1 ? (
         <div className="mb-1">
             <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">{match.label1 || 'Equipo 1'}</div>
             <div className="relative">
                <select 
                    className="w-full text-sm p-1 pr-6 border border-slate-300 rounded appearance-none bg-slate-50 focus:border-emerald-500 focus:outline-none"
                    onChange={(e) => onSelectTeam(match.id, 'team1', e.target.value)} value="">
                    <option value="" disabled>Seleccionar...</option>
                    {match.source1.map(t => {
                        const isDisabled = selectedTeams.includes(t) && t !== match.team1;
                        return <option key={t} value={t} disabled={isDisabled}>{t} {isDisabled ? '(Ya elegido)' : ''}</option>;
                    })}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none"/>
             </div>
         </div>
      ) : (
        <div onClick={() => canPickWinner && onPick(match.id, match.team1)}
            className={`flex justify-between items-center mb-1 p-1 rounded transition-colors ${match.winner === match.team1 ? 'bg-emerald-50' : (canPickWinner ? 'hover:bg-slate-50' : '')}`}>
            <div className={`flex items-center gap-2 text-sm font-medium ${match.winner === match.team1 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                <TeamWithFlag name={match.team1} />
                {isManual && match.winner === match.team1 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <span className={`px-2 py-0.5 rounded text-sm font-bold ${match.winner === match.team1 ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-800'}`}>{match.score1}</span>
        </div>
      )}

      {showSelector2 ? (
         <div>
             <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">{match.label2 || 'Equipo 2'}</div>
             <div className="relative">
                <select 
                    className="w-full text-sm p-1 pr-6 border border-slate-300 rounded appearance-none bg-slate-50 focus:border-emerald-500 focus:outline-none"
                    onChange={(e) => onSelectTeam(match.id, 'team2', e.target.value)} value="">
                    <option value="" disabled>Seleccionar...</option>
                    {match.source2.map(t => {
                        const isDisabled = selectedTeams.includes(t) && t !== match.team2;
                        return <option key={t} value={t} disabled={isDisabled}>{t} {isDisabled ? '(Ya elegido)' : ''}</option>;
                    })}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none"/>
             </div>
         </div>
      ) : (
        <div onClick={() => canPickWinner && onPick(match.id, match.team2)}
            className={`flex justify-between items-center p-1 rounded transition-colors ${match.winner === match.team2 ? 'bg-emerald-50' : (canPickWinner ? 'hover:bg-slate-50' : '')}`}>
            <div className={`flex items-center gap-2 text-sm font-medium ${match.winner === match.team2 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                <TeamWithFlag name={match.team2} />
                {isManual && match.winner === match.team2 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <span className={`px-2 py-0.5 rounded text-sm font-bold ${match.winner === match.team2 ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-800'}`}>{match.score2}</span>
        </div>
      )}
      
      {canPickWinner && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100">
              <span className="bg-slate-800/80 text-white text-xs px-2 py-1 rounded shadow-lg backdrop-blur">Click ganador</span>
          </div>
      )}
    </div>
  );
};

const GroupReorder = ({ groupName, teams, onReorder, isManual }) => {
    const move = (idx, dir) => {
        if (!isManual) return;
        const newTeams = [...teams];
        if (dir === -1 && idx > 0) {
            [newTeams[idx], newTeams[idx-1]] = [newTeams[idx-1], newTeams[idx]];
        } else if (dir === 1 && idx < teams.length - 1) {
            [newTeams[idx], newTeams[idx+1]] = [newTeams[idx+1], newTeams[idx]];
        }
        onReorder(groupName, newTeams);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-4 py-2 text-white font-bold flex justify-between items-center">
                <span>Grupo {groupName}</span>
            </div>
            <div className="p-0">
                <table className="w-full text-sm text-left">
                    <tbody className="divide-y divide-slate-100">
                        {teams.map((team, idx) => (
                            <tr key={team} className={idx < 2 ? "bg-green-50/50" : (idx === 2 ? "bg-amber-50/30" : "")}>
                                <td className="px-3 py-2 font-medium text-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                                        <TeamWithFlag name={team} />
                                    </div>
                                    {isManual && (
                                        <div className="flex flex-col gap-0.5">
                                            <button onClick={() => move(idx, -1)} disabled={idx===0} className="text-slate-300 hover:text-slate-600 disabled:opacity-0"><ChevronUp className="w-3 h-3"/></button>
                                            <button onClick={() => move(idx, 1)} disabled={idx===teams.length-1} className="text-slate-300 hover:text-slate-600 disabled:opacity-0"><ChevronDown className="w-3 h-3"/></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                   <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span><TeamWithFlag name={team.name} /></div>
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

const ThirdsTable = ({ thirds, onReorder, isManual }) => {
    const move = (idx, dir) => {
        if (!isManual) return;
        const newThirds = [...thirds];
        if (dir === -1 && idx > 0) {
            [newThirds[idx], newThirds[idx-1]] = [newThirds[idx-1], newThirds[idx]];
        } else if (dir === 1 && idx < thirds.length - 1) {
            [newThirds[idx], newThirds[idx+1]] = [newThirds[idx+1], newThirds[idx]];
        }
        onReorder(newThirds);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="bg-slate-700 px-4 py-2 text-white font-bold flex justify-between items-center">
                <span>Ranking de Terceros (Top 8 Clasifican)</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {thirds.map((t, idx) => (
                    <div key={t.group} className={`flex items-center justify-between p-2 rounded border ${idx < 8 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold w-6 ${idx<8?'text-amber-700':'text-slate-400'}`}>{idx+1}</span>
                            <span className="text-xs font-mono bg-slate-200 px-1 rounded mr-2">Gr.{t.group}</span>
                            <TeamWithFlag name={t.team} />
                        </div>
                        {isManual && (
                            <div className="flex gap-1">
                                <button onClick={() => move(idx, -1)} disabled={idx===0} className="p-1 hover:bg-slate-200 rounded"><ChevronUp className="w-3 h-3 text-slate-500"/></button>
                                <button onClick={() => move(idx, 1)} disabled={idx===thirds.length-1} className="p-1 hover:bg-slate-200 rounded"><ChevronDown className="w-3 h-3 text-slate-500"/></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function App() {
  const [simMode, setSimMode] = useState(MODES.RANK);
  const [simulation, setSimulation] = useState(null);
  const [activeTab, setActiveTab] = useState('playoffs');
  const [isManualMode, setIsManualMode] = useState(false);
  
  // Manual State
  const [manualPlayoffs, setManualPlayoffs] = useState({});
  const [manualGroups, setManualGroups] = useState({}); // { A: [team1, team2...], ... }
  const [manualThirds, setManualThirds] = useState([]); // [{ group: 'A', team: 'Mexico' }, ...]
  const [manualBracket, setManualBracket] = useState({});
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); }
  }, []);

  const downloadImage = () => {
    if (!window.html2canvas) { alert("Cargando librería..."); return; }
    const element = document.getElementById('bracket-export');
    window.html2canvas(element, { 
        backgroundColor: "#ffffff", 
        scale: 2, 
        useCORS: true 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Mundial2026_Pronostico.jpg`; // JPG para asegurar fondo
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
    });
  };

  // --- MANUAL FLOW LOGIC ---

  // 1. Recalculate Groups when Playoffs change
  useEffect(() => {
      if (simMode !== MODES.MANUAL || !manualPlayoffs.uefa_a) return; 
      
      const getW = (key) => manualPlayoffs[key]?.winner || `Ganador ${PLAYOFF_STRUCTURE[key].name}`;
      
      setManualGroups(prev => {
          const next = { ...prev };
          INITIAL_GROUPS_DEF.forEach(gDef => {
              if (!next[gDef.name]) {
                  next[gDef.name] = gDef.teams.map(t => {
                      const pKey = Object.keys(PLAYOFF_STRUCTURE).find(k => `Ganador ${PLAYOFF_STRUCTURE[k].name}` === t);
                      return pKey ? getW(pKey) : t;
                  });
              } else {
                  next[gDef.name] = next[gDef.name].map(t => {
                      const playoffKey = Object.keys(PLAYOFF_STRUCTURE).find(k => PLAYOFF_STRUCTURE[k].targetGroup === gDef.name);
                      if (!playoffKey) return t;
                      const fixed = gDef.teams.filter(x => !x.includes('Ganador'));
                      if (!fixed.includes(t)) {
                          return getW(playoffKey);
                      }
                      return t;
                  });
              }
          });
          return next;
      });
  }, [manualPlayoffs, simMode]);

  // 2. Update Thirds when Groups Change
  useEffect(() => {
      if (simMode !== MODES.MANUAL || Object.keys(manualGroups).length === 0) return;
      
      setManualThirds(prev => {
          let newOrder = prev.length > 0 ? [...prev] : "ABCDEFGHIJKL".split('').map(g => ({ group: g, team: '' }));
          return newOrder.map(item => ({
              ...item,
              team: manualGroups[item.group]?.[2] || 'TBD'
          }));
      });
  }, [manualGroups, simMode]);

  // 3. Update Bracket when Groups or Thirds Change
  useEffect(() => {
      if (simMode !== MODES.MANUAL || Object.keys(manualGroups).length === 0 || manualThirds.length === 0) return;
      generateManualBracket();
  }, [manualGroups, manualThirds]);


  const generateManualBracket = () => {
      const getPos = (g, p) => manualGroups[g]?.[p-1];
      const qualifiedThirds = manualThirds.slice(0, 8); 
      const get3rd = (allowed) => {
          const list = allowed.replace(/\s+/g, '').split('');
          const found = qualifiedThirds.find(t => list.includes(t.group));
          return found ? found.team : 'TBD'; 
      };

      const r32Defs = [
        { id: 73, s1: {t: 'pos', g: 'A'}, s2: {t: 'pos', g: 'B'}, label1: '2º A', label2: '2º B', stadium: 'LA Stadium' },
        { id: 74, s1: {t: 'pos', g: 'E', p: 1}, s2: {t: '3rd', g: 'ABCD F'}, label1: '1º E', label2: '3º A/B/C/D/F', stadium: 'Boston' },
        { id: 75, s1: {t: 'pos', g: 'F', p: 1}, s2: {t: 'pos', g: 'C'}, label1: '1º F', label2: '2º C', stadium: 'Monterrey' },
        { id: 76, s1: {t: 'pos', g: 'C', p: 1}, s2: {t: 'pos', g: 'F'}, label1: '1º C', label2: '2º F', stadium: 'Houston' },
        { id: 77, s1: {t: 'pos', g: 'I', p: 1}, s2: {t: '3rd', g: 'CD FGH'}, label1: '1º I', label2: '3º C/D/F/G/H', stadium: 'NY/NJ' },
        { id: 78, s1: {t: 'pos', g: 'E'}, s2: {t: 'pos', g: 'I'}, label1: '2º E', label2: '2º I', stadium: 'Dallas' },
        { id: 79, s1: {t: 'pos', g: 'A', p: 1}, s2: {t: '3rd', g: 'C E FHI'}, label1: '1º A', label2: '3º C/E/F/H/I', stadium: 'CDMX' },
        { id: 80, s1: {t: 'pos', g: 'L', p: 1}, s2: {t: '3rd', g: 'EHIJK'}, label1: '1º L', label2: '3º E/H/I/J/K', stadium: 'Atlanta' },
        { id: 81, s1: {t: 'pos', g: 'D', p: 1}, s2: {t: '3rd', g: 'BEFIJ'}, label1: '1º D', label2: '3º B/E/F/I/J', stadium: 'SF Bay Area' },
        { id: 82, s1: {t: 'pos', g: 'G', p: 1}, s2: {t: '3rd', g: 'AEHIJ'}, label1: '1º G', label2: '3º A/E/H/I/J', stadium: 'Seattle' },
        { id: 83, s1: {t: 'pos', g: 'K'}, s2: {t: 'pos', g: 'L'}, label1: '2º K', label2: '2º L', stadium: 'Toronto' },
        { id: 84, s1: {t: 'pos', g: 'H', p: 1}, s2: {t: 'pos', g: 'J'}, label1: '1º H', label2: '2º J', stadium: 'LA Stadium' },
        { id: 85, s1: {t: 'pos', g: 'B', p: 1}, s2: {t: '3rd', g: 'EFGIJ'}, label1: '1º B', label2: '3º E/F/G/I/J', stadium: 'Vancouver' },
        { id: 86, s1: {t: 'pos', g: 'J', p: 1}, s2: {t: 'pos', g: 'H'}, label1: '1º J', label2: '2º H', stadium: 'Miami' },
        { id: 87, s1: {t: 'pos', g: 'K', p: 1}, s2: {t: '3rd', g: 'DEIJL'}, label1: '1º K', label2: '3º D/E/I/J/L', stadium: 'Kansas City' },
        { id: 88, s1: {t: 'pos', g: 'D'}, s2: {t: 'pos', g: 'G'}, label1: '2º D', label2: '2º G', stadium: 'Dallas' }
      ];

      const r32 = r32Defs.map(d => {
          const t1 = d.s1.t === '3rd' ? get3rd(d.s1.g) : getPos(d.s1.g, d.s1.p || 2);
          const t2 = d.s2.t === '3rd' ? get3rd(d.s2.g) : getPos(d.s2.g, d.s2.p || 2);
          
          const existing = manualBracket?.r32?.find(m => m.id === d.id);
          const isSameConfig = existing && existing.team1 === t1 && existing.team2 === t2;
          const keepWinner = isSameConfig ? existing.winner : null;
          const s1 = isSameConfig ? existing.score1 : '';
          const s2 = isSameConfig ? existing.score2 : '';

          return { 
              id: d.id, stadium: d.stadium, team1: t1, team2: t2, winner: keepWinner, score1: s1, score2: s2
          };
      });

      const generateRound = (prev, defs, currentArr) => defs.map(d => {
          const m1 = prev.find(m => m.id === d.s1);
          const m2 = prev.find(m => m.id === d.s2);
          const t1 = m1?.winner ?? null;
          const t2 = m2?.winner ?? null;
          
          const existing = currentArr?.find(m => m.id === d.id);
          const isSameConfig = existing && existing.team1 === t1 && existing.team2 === t2;
          const keepWinner = isSameConfig ? existing.winner : null;
          const sc1 = isSameConfig ? existing.score1 : '';
          const sc2 = isSameConfig ? existing.score2 : '';

          return { id: d.id, stadium: d.stadium, team1: t1, team2: t2, winner: keepWinner, score1: sc1, score2: sc2 };
      });

      const r16Defs = [
        { id: 89, s1: 74, s2: 77, stadium: 'Philadelphia' }, { id: 90, s1: 73, s2: 75, stadium: 'Houston' },
        { id: 91, s1: 76, s2: 78, stadium: 'NY/NJ' }, { id: 92, s1: 79, s2: 80, stadium: 'Azteca' },
        { id: 93, s1: 83, s2: 84, stadium: 'Dallas' }, { id: 94, s1: 81, s2: 82, stadium: 'Seattle' },
        { id: 95, s1: 86, s2: 88, stadium: 'Atlanta' }, { id: 96, s1: 85, s2: 87, stadium: 'Vancouver' }
      ];
      const qfDefs = [
        { id: 97, s1: 89, s2: 90, stadium: 'Boston' }, { id: 98, s1: 93, s2: 94, stadium: 'LA Stadium' },
        { id: 99, s1: 91, s2: 92, stadium: 'Miami' }, { id: 100, s1: 95, s2: 96, stadium: 'Kansas City' }
      ];
      const sfDefs = [
        { id: 101, s1: 97, s2: 98, stadium: 'Dallas' }, { id: 102, s1: 99, s2: 100, stadium: 'Atlanta' }
      ];

      const r16 = generateRound(r32, r16Defs, manualBracket?.r16);
      const qf = generateRound(r16, qfDefs, manualBracket?.qf);
      const sf = generateRound(qf, sfDefs, manualBracket?.sf);

      const getL = (round, id) => { const m = round.find(x => x.id === id); return m?.winner === m?.team1 ? m?.team2 : m?.team1; };
      const wSf1 = sf.find(m => m.id === 101)?.winner ?? null;
      const wSf2 = sf.find(m => m.id === 102)?.winner ?? null;
      
      const exFinal = manualBracket?.final?.[0];
      const isSameFinal = exFinal && exFinal.team1 === wSf1 && exFinal.team2 === wSf2;
      const kWF = isSameFinal ? exFinal.winner : null;
      const fSc1 = isSameFinal ? exFinal.score1 : '';
      const fSc2 = isSameFinal ? exFinal.score2 : '';
      const final = [{ id: 104, stadium: 'NY/NJ', team1: wSf1, team2: wSf2, winner: kWF, score1: fSc1, score2: fSc2 }];

      const lSf1 = getL(sf, 101) ?? null;
      const lSf2 = getL(sf, 102) ?? null;
      const exThird = manualBracket?.third;
      const isSameThird = exThird && exThird.team1 === lSf1 && exThird.team2 === lSf2;
      const kW3 = isSameThird ? exThird.winner : null;
      const tSc1 = isSameThird ? exThird.score1 : '';
      const tSc2 = isSameThird ? exThird.score2 : '';
      const third = { id: 103, stadium: 'Miami', team1: lSf1, team2: lSf2, winner: kW3, score1: tSc1, score2: tSc2 };

      setManualBracket({ r32, r16, qf, sf, third, final });
  };

  // --- TRAVERSAL HELPERS ---
  const getBracketMatch = (bracket, id) => {
      for (const k of ['r32', 'r16', 'qf', 'sf', 'final']) {
          const m = bracket[k].find(x => x.id === id);
          if (m) return m;
      }
      if (bracket.third.id === id) return bracket.third;
      return null;
  };

  const clearFutureRounds = (bracket, matchId) => {
      const mapInfo = NEXT_MATCH_MAP[matchId];
      if (mapInfo) {
          const nextMatch = getBracketMatch(bracket, mapInfo.next);
          if (nextMatch) {
              nextMatch[mapInfo.slot] = null;
              nextMatch.winner = null;
              nextMatch.score1 = ''; nextMatch.score2 = '';
              clearFutureRounds(bracket, nextMatch.id);
          }
          if (mapInfo.loserNext) {
              const thirdMatch = bracket.third;
              if (thirdMatch && thirdMatch.id === mapInfo.loserNext) {
                  thirdMatch[mapInfo.loserSlot] = null;
                  thirdMatch.winner = null;
                  thirdMatch.score1 = ''; thirdMatch.score2 = '';
              }
          }
      }
  };

  // --- MANUAL HANDLERS ---

  const executePlayoffPick = (bracketKey, matchIndex, winner) => {
      const newPlayoffs = JSON.parse(JSON.stringify(manualPlayoffs));
      const match = newPlayoffs[bracketKey].matches[matchIndex];
      match.winner = winner;
      match.score1 = winner === match.team1 ? '✔' : '';
      match.score2 = winner === match.team2 ? '✔' : '';
      
      // Propagate in Bracket/Ladder
      if (PLAYOFF_STRUCTURE[bracketKey].type === 'bracket') {
          if (matchIndex === 0) newPlayoffs[bracketKey].matches[2].team1 = winner;
          if (matchIndex === 1) newPlayoffs[bracketKey].matches[2].team2 = winner;
          if (matchIndex === 2) newPlayoffs[bracketKey].winner = winner;
      } else {
          // Ladder: [seed, semi1, semi2] inputs. 
          if (matchIndex === 0) newPlayoffs[bracketKey].matches[1].team2 = winner;
          if (matchIndex === 1) newPlayoffs[bracketKey].winner = winner;
      }
      
      setManualPlayoffs(newPlayoffs);
      updateR32Sources(newPlayoffs);
  };

  const updateR32Sources = (currentPlayoffs) => {
      // Reconstruct Groups based on new playoff winners
      const dynamicGroups = getGroupsWithWinners(currentPlayoffs);
      
      // Update manual bracket sources
      setManualBracket(prev => {
          const next = { ...prev };
          const getGTeams = (gName) => dynamicGroups.find(g => g.name === gName)?.teams || [];
          
          // Fixed helper to avoid crash on empty space
          const getMTeams = (str) => {
              let t = []; 
              // Safe split removing spaces
              str.replace(/\s+/g, '').split('').forEach(k => {
                  const grp = dynamicGroups.find(g => g.name === k);
                  if (grp) t.push(...grp.teams);
              }); 
              return t;
          };

          if (next.r32) {
              next.r32 = next.r32.map(m => {
                  if (!m.meta) return m; 
                  const s1 = m.meta.s1.t === '3rd' ? getMTeams(m.meta.s1.g) : getGTeams(m.meta.s1.g);
                  const s2 = m.meta.s2.t === '3rd' ? getMTeams(m.meta.s2.g) : getGTeams(m.meta.s2.g);
                  return { ...m, source1: s1, source2: s2 };
              });
          }
          return next;
      });
  };

  const getGroupsWithWinners = (playoffsState) => {
      const getW = (key) => playoffsState[key]?.winner || `Ganador ${PLAYOFF_STRUCTURE[key].name}`;
      return [
        { name: 'A', teams: ['México', 'Sudáfrica', 'República de Corea', getW('uefa_d')] },
        { name: 'B', teams: ['Canadá', getW('uefa_a'), 'Catar', 'Suiza'] },
        { name: 'C', teams: ['Brasil', 'Marruecos', 'Haití', 'Escocia'] },
        { name: 'D', teams: ['Estados Unidos', 'Paraguay', 'Australia', getW('uefa_c')] },
        { name: 'E', teams: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'] },
        { name: 'F', teams: ['Países Bajos', 'Japón', getW('uefa_b'), 'Túnez'] },
        { name: 'G', teams: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'] },
        { name: 'H', teams: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay'] },
        { name: 'I', teams: ['Francia', 'Senegal', getW('inter_a'), 'Noruega'] },
        { name: 'J', teams: ['Argentina', 'Argelia', 'Austria', 'Jordania'] },
        { name: 'K', teams: ['Portugal', getW('inter_b'), 'Uzbekistán', 'Colombia'] },
        { name: 'L', teams: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'] },
      ];
  };

  const handleManualSelect = (matchId, slot, teamName) => {
      if (!isManualMode) return;
      const newBracket = JSON.parse(JSON.stringify(manualBracket));
      const match = getBracketMatch(newBracket, matchId);
      if (match) {
          match[slot] = teamName;
          match.winner = null;
          match.score1 = ''; match.score2 = '';
          clearFutureRounds(newBracket, matchId);
      }
      setManualBracket(newBracket);
  };

  const handleManualPick = (matchId, winnerName) => {
      if (!isManualMode) return;
      const newBracket = JSON.parse(JSON.stringify(manualBracket));
      const match = getBracketMatch(newBracket, matchId);
      if (!match) return;

      match.winner = winnerName;
      if (winnerName === match.team1) { match.score1 = '✔'; match.score2 = ''; } 
      else { match.score1 = ''; match.score2 = '✔'; }

      if (match.id === 104 && winnerName) setTimeout(() => setShowWinnerPopup(true), 600);

      const mapInfo = NEXT_MATCH_MAP[matchId];
      if (mapInfo) {
          const nextMatch = getBracketMatch(newBracket, mapInfo.next);
          if (nextMatch) {
              nextMatch.winner = null; 
              nextMatch.score1 = ''; nextMatch.score2 = '';
              nextMatch[mapInfo.slot] = winnerName;
              clearFutureRounds(newBracket, nextMatch.id);
          }
          if (mapInfo.loserNext) {
               const thirdMatch = newBracket.third;
               if(thirdMatch.id === mapInfo.loserNext) {
                   thirdMatch[mapInfo.loserSlot] = (winnerName === match.team1 ? match.team2 : match.team1);
                   thirdMatch.winner = null;
                   thirdMatch.score1 = ''; thirdMatch.score2 = '';
               }
          }
      }
      setManualBracket(newBracket);
  };

  const handleGroupReorder = (gName, newTeams) => {
      setManualGroups(prev => ({ ...prev, [gName]: newTeams }));
  };

  const handleThirdsReorder = (newThirds) => {
      setManualThirds(newThirds);
  };

  const runSimulation = () => {
    setShowWinnerPopup(false);
    
    // Init Manual
    if (simMode === MODES.MANUAL) {
        // Init Playoffs
        let pRes = {};
        Object.keys(PLAYOFF_STRUCTURE).forEach(k => {
            const def = PLAYOFF_STRUCTURE[k];
            let matches = [];
            if(def.type==='bracket') {
                matches = [
                    { id: `${k}-s1`, team1: def.teams[0], team2: def.teams[3], winner:null, score1:'', score2:'' },
                    { id: `${k}-s2`, team1: def.teams[1], team2: def.teams[2], winner:null, score1:'', score2:'' },
                    { id: `${k}-f`, team1: null, team2: null, winner:null, score1:'', score2:'' }
                ];
            } else {
                matches = [
                    { id: `${k}-s`, team1: def.teams[1], team2: def.teams[2], winner:null, score1:'', score2:'' },
                    { id: `${k}-f`, team1: def.teams[0], team2: null, winner:null, score1:'', score2:'' }
                ];
            }
            pRes[k] = { name: def.name, matches, winner: null };
        });
        setManualPlayoffs(pRes);
        // Explicitly init empty groups based on definition so they are ready for population via effect
        const initialGroups = {};
        INITIAL_GROUPS_DEF.forEach(g => initialGroups[g.name] = g.teams);
        setManualGroups(initialGroups);
        setManualBracket({});
        setIsManualMode(true);
        setActiveTab('playoffs');
    } else {
        // Auto
        let playoffResults = {};
        const runUefaBracket = (key, teams) => {
            const semi1 = { ...simulateMatch(teams[0], teams[3], simMode, true), id: `${key}-s1` };
            const semi2 = { ...simulateMatch(teams[1], teams[2], simMode, true), id: `${key}-s2` };
            const final = { ...simulateMatch(semi1.winner, semi2.winner, simMode, true), id: `${key}-f` };
            return { name: PLAYOFF_STRUCTURE[key].name, matches: [semi1, semi2, final], winner: final.winner };
        };
        const runInterLadder = (key, teams) => {
            const semi = { ...simulateMatch(teams[1], teams[2], simMode, true), id: `${key}-s` };
            const final = { ...simulateMatch(teams[0], semi.winner, simMode, true), id: `${key}-f` };
            return { name: PLAYOFF_STRUCTURE[key].name, matches: [semi, final], winner: final.winner };
        };
        
        playoffResults['uefa_a'] = runUefaBracket('uefa_a', PLAYOFF_STRUCTURE.uefa_a.teams);
        playoffResults['uefa_b'] = runUefaBracket('uefa_b', PLAYOFF_STRUCTURE.uefa_b.teams);
        playoffResults['uefa_c'] = runUefaBracket('uefa_c', PLAYOFF_STRUCTURE.uefa_c.teams);
        playoffResults['uefa_d'] = runUefaBracket('uefa_d', PLAYOFF_STRUCTURE.uefa_d.teams);
        playoffResults['inter_a'] = runInterLadder('inter_a', PLAYOFF_STRUCTURE.inter_a.teams);
        playoffResults['inter_b'] = runInterLadder('inter_b', PLAYOFF_STRUCTURE.inter_b.teams);
        
        setSimulation({
            playoffs: playoffResults,
            // Groups populated in next pass inside render logic or here? 
            // In auto mode we use the getW helper inside groups loop, so we are fine.
            groups: {} // Will be filled by existing logic in render/effect if needed, but we used local var 'groupResults' in previous code. 
            // Let's ensure simulation state has groups.
        });
        setIsManualMode(false);
        setActiveTab('groups');
    }
  };

  const displayPlayoffs = isManualMode ? manualPlayoffs : (simulation?.playoffs || {});
  const displayBracket = isManualMode ? manualBracket : (simulation?.bracket || {});
  
  const selectedTeamsR32 = isManualMode && manualBracket.r32 ? manualBracket.r32.flatMap(m => [m.team1, m.team2].filter(Boolean)) : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 shadow-lg border-b border-emerald-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Mundial 2026 Simulator</h1>
                <p className="text-emerald-200 text-sm">Simulación & Prode Interactivo</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 bg-emerald-900/50 p-1 rounded-lg backdrop-blur-sm">
               <button onClick={() => setSimMode(MODES.RANK)} className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-all ${simMode === MODES.RANK ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}><Shield className="w-3 h-3 inline mr-1" />Ranking</button>
               <button onClick={() => setSimMode(MODES.SURPRISE)} className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-all ${simMode === MODES.SURPRISE ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}><Shuffle className="w-3 h-3 inline mr-1" />Sorpresa</button>
               <button onClick={() => setSimMode(MODES.RANDOM)} className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-all ${simMode === MODES.RANDOM ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}><RefreshCw className="w-3 h-3 inline mr-1" />Azar</button>
               <button onClick={() => setSimMode(MODES.MANUAL)} className={`px-3 py-1.5 rounded text-xs md:text-sm font-bold transition-all border border-emerald-400/50 ${simMode === MODES.MANUAL ? 'bg-emerald-400 text-emerald-900 shadow' : 'text-emerald-50 hover:bg-emerald-800'}`}><Pencil className="w-3 h-3 inline mr-1" />Pronóstico</button>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button onClick={runSimulation} className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-8 py-3 rounded-full font-bold shadow-lg shadow-yellow-500/20 transform hover:scale-105 transition-all flex items-center gap-2"><Play className="w-5 h-5" fill="currentColor" />{Object.keys(manualPlayoffs).length > 0 ? 'Reiniciar' : 'Comenzar'}</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {!simulation && Object.keys(manualPlayoffs).length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <Trophy className="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p className="text-xl">Elige un modo y presiona "Comenzar" para generar el torneo.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row border-b border-slate-200 mb-6 gap-2 md:gap-0">
              <div className="flex overflow-x-auto">
                <button onClick={() => setActiveTab('playoffs')} className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'playoffs' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>1. Repechajes</button>
                <button onClick={() => setActiveTab('groups')} className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'groups' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>2. Grupos</button>
                <button onClick={() => setActiveTab('bracket')} className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'bracket' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>3. Fase Final</button>
              </div>
              
              {activeTab === 'bracket' && (
                  <div className="ml-auto flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => isManualMode && setIsManualMode(!isManualMode)}>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isManualMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isManualMode ? 'translate-x-4' : ''}`} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 select-none flex items-center gap-1">
                              {isManualMode ? <MousePointerClick className="w-4 h-4"/> : null} 
                              {isManualMode ? 'Modo Pronóstico' : 'Solo Lectura'}
                          </span>
                      </div>
                      <button onClick={downloadImage} className="text-slate-500 hover:text-emerald-600" title="Descargar Imagen">
                          <Download className="w-5 h-5" />
                      </button>
                  </div>
              )}
            </div>

            {/* VIEWS */}
            {activeTab === 'playoffs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {Object.keys(displayPlayoffs).map((key) => {
                        const p = displayPlayoffs[key];
                        return (
                            <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-600"/> {p.name}</h3>
                                 <div className="space-y-2 mb-3">
                                    {p.matches.map((m, midx) => (
                                        <MatchMini key={m.id} match={m} isManual={isManualMode} onPick={(mid, winner) => executePlayoffPick(key, midx, winner)} />
                                    ))}
                                </div>
                                <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-center text-sm font-bold border border-emerald-100 flex justify-center items-center gap-2">
                                    <span>Clasificado:</span> <TeamWithFlag name={p.winner} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'groups' && (
              <div className="animate-fadeIn">
                {isManualMode ? (
                    <>
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-center text-sm font-medium border border-blue-100 mb-6 flex items-center justify-center gap-2">
                            <MousePointerClick className="w-4 h-4" />
                            Arrastra los equipos (flechas) para definir las posiciones finales de cada grupo.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {Object.keys(manualGroups).map(gName => (
                                <GroupReorder key={gName} groupName={gName} teams={manualGroups[gName]} isManual={true} onReorder={handleGroupReorder} />
                            ))}
                        </div>
                        <ThirdsTable thirds={manualThirds} isManual={true} onReorder={handleThirdsReorder} />
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {simulation?.groups && Object.keys(simulation.groups).map(g => (
                          <GroupCard key={g} group={{name: g}} standings={simulation.groups[g]} />
                        ))}
                    </div>
                )}
              </div>
            )}

            {activeTab === 'bracket' && (
              <div id="bracket-export" className="space-y-8 animate-fadeIn pb-20 bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm">
                
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Mi Pronóstico Mundial 2026</h2>
                    <p className="text-slate-500 text-sm">Simulador & Prode Interactivo</p>
                </div>

                {isManualMode && (
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-center text-sm font-medium border border-blue-100 flex items-center justify-center gap-2">
                        <MousePointerClick className="w-4 h-4" />
                        Modo Pronóstico Activo: Haz clic sobre los equipos en el cuadro para avanzar ganadores.
                    </div>
                )}

                {/* Champion */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-2xl p-6 text-center shadow-sm max-w-2xl mx-auto">
                  <h2 className="text-amber-800 text-xs font-bold uppercase tracking-widest mb-2">Campeón del Mundo 2026</h2>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Award className="w-12 h-12 text-yellow-500" />
                    <div className="text-3xl font-black text-slate-900 flex items-center gap-4">
                       <TeamWithFlag name={displayBracket.final?.[0]?.winner} big={true} className="text-3xl" />
                    </div>
                  </div>
                </div>

                {/* Final & 3rd */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/> La Gran Final</h3>
                        <div className="w-full max-w-sm">
                            <InteractiveMatchCard match={displayBracket.final?.[0]} isFinal={true} onPick={handleManualPick} isManual={isManualMode} onSelectTeam={handleManualSelect} />
                        </div>
                    </div>
                     <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold text-slate-600 mb-3 flex items-center gap-2"><Medal className="w-5 h-5 text-amber-600"/> Tercer Puesto</h3>
                        <div className="w-full max-w-sm">
                            <InteractiveMatchCard match={displayBracket.third} onPick={handleManualPick} isManual={isManualMode} onSelectTeam={handleManualSelect} />
                        </div>
                    </div>
                </div>

                {/* Main Bracket */}
                <div className="flex flex-col gap-8">
                    {[{ title: 'Semifinales', data: displayBracket.sf }, { title: 'Cuartos de Final', data: displayBracket.qf }, { title: 'Octavos de Final', data: displayBracket.r16 }, { title: '16vos de Final', data: displayBracket.r32 }].map((round, idx) => (
                        <div key={idx}>
                             <h3 className="text-md font-bold text-slate-600 mb-3 border-l-4 border-emerald-500 pl-3">{round.title}</h3>
                             <div className={`grid gap-3 ${idx === 0 ? 'grid-cols-1 md:grid-cols-2' : (idx === 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4')}`}>
                                 {round.data?.map(m => (
                                     <InteractiveMatchCard 
                                        key={m.id} 
                                        match={m} 
                                        onPick={handleManualPick} 
                                        isManual={isManualMode} 
                                        onSelectTeam={handleManualSelect}
                                        selectedTeams={selectedTeamsR32}
                                     />
                                 ))}
                             </div>
                        </div>
                    ))}
                </div>
                
                <div className="text-center text-slate-400 text-xs mt-8">Generado con Simulador Mundial 2026</div>
              </div>
            )}
          </>
        )}
      </main>

      {showWinnerPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border border-white/20 relative">
                <button onClick={() => setShowWinnerPopup(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center shadow-inner">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">¡Tenemos Campeón!</h3>
                <div className="flex items-center justify-center gap-3 my-4">
                    <TeamWithFlag name={displayBracket.final[0]?.winner} big={true} className="text-2xl font-black text-slate-900" />
                </div>
                <p className="text-slate-500 text-sm mb-6">Tu pronóstico está completo. ¡Descarga la imagen y compártela!</p>
                <button 
                    onClick={() => { downloadImage(); setShowWinnerPopup(false); }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Descargar Imagen
                </button>
            </div>
        </div>
      )}
    </div>
  );
}