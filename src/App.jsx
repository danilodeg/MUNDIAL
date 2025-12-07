import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Shuffle, Play, RefreshCw, Shield, Award, Medal, Globe, Download, MousePointerClick, CheckCircle2, Pencil, ChevronDown, X } from 'lucide-react';

// --- DATA & CONFIGURATION ---

const getFlag = (iso) => iso ? `https://flagcdn.com/w40/${iso}.png` : null;

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

const simulateMatch = (teamA, teamB, mode, cantDraw = false) => {
  // If teams are not defined in manual mode, return placeholders
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
            {iso && <img src={getFlag(iso)} alt={name} className={`${big ? 'w-10 h-7' : 'w-5 h-3.5'} shadow-sm object-cover rounded-[1px]`} />}
            <span className={`truncate ${big ? 'text-lg' : ''}`}>{name || (big ? 'A definir' : '...')}</span>
        </div>
    );
};

const MatchMini = ({ match, onPick, isManual }) => {
    const canPick = isManual && match.team1 && match.team2 && !match.winner;
    return (
        <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
            <div 
                className={`flex-1 flex items-center gap-2 cursor-pointer p-1 rounded ${match.winner === match.team1 ? "font-bold text-slate-900 bg-emerald-50" : "text-slate-500 hover:bg-slate-50"}`}
                onClick={() => isManual && onPick && onPick(match.id, match.team1)}
            >
                <TeamWithFlag name={match.team1} />
            </div>
            <div className="bg-slate-100 px-1 rounded text-slate-700 font-mono mx-2 min-w-[30px] text-center">
                {match.score1}-{match.score2}
            </div>
            <div 
                className={`flex-1 flex justify-end items-center gap-2 cursor-pointer p-1 rounded ${match.winner === match.team2 ? "font-bold text-slate-900 bg-emerald-50" : "text-slate-500 hover:bg-slate-50"}`}
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
  const canPickWinner = match.team1 && match.team2;

  return (
    <div className={`relative bg-white p-3 rounded-lg border transition-all duration-200
        ${isFinal ? 'border-yellow-400 shadow-md ring-1 ring-yellow-100' : 'border-slate-200 shadow-sm'} 
        ${isManual && (!match.team1 || !match.team2) ? 'ring-2 ring-blue-100' : ''}
        ${isManual && canPickWinner && !match.winner ? 'ring-2 ring-emerald-400 shadow-md' : ''}
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
        <div onClick={() => isManual && canPickWinner && onPick(match.id, match.team1)}
            className={`flex justify-between items-center mb-1 p-1 rounded cursor-pointer transition-colors ${match.winner === match.team1 ? 'bg-emerald-50' : (isManual && canPickWinner ? 'hover:bg-slate-50' : '')}`}>
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
        <div onClick={() => isManual && canPickWinner && onPick(match.id, match.team2)}
            className={`flex justify-between items-center p-1 rounded cursor-pointer transition-colors ${match.winner === match.team2 ? 'bg-emerald-50' : (isManual && canPickWinner ? 'hover:bg-slate-50' : '')}`}>
            <div className={`flex items-center gap-2 text-sm font-medium ${match.winner === match.team2 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                <TeamWithFlag name={match.team2} />
                {isManual && match.winner === match.team2 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <span className={`px-2 py-0.5 rounded text-sm font-bold ${match.winner === match.team2 ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-800'}`}>{match.score2}</span>
        </div>
      )}
      
      {isManual && canPickWinner && !match.winner && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100">
              <span className="bg-slate-800/80 text-white text-xs px-2 py-1 rounded shadow-lg backdrop-blur">Click ganador</span>
          </div>
      )}
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

export default function App() {
  const [simMode, setSimMode] = useState(MODES.RANK);
  const [simulation, setSimulation] = useState(null);
  const [activeTab, setActiveTab] = useState('playoffs');
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualBracket, setManualBracket] = useState({}); 
  const [manualPlayoffs, setManualPlayoffs] = useState({});
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
        backgroundColor: "#ffffff", // Fondo blanco sólido
        scale: 2, 
        useCORS: true 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Mundial2026_Pronostico.jpg`; // JPG para asegurar fondo
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
    });
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

  const handleManualPlayoffPick = (bracketKey, matchId, winnerName) => {
      if (!isManualMode) return;
      const newPlayoffs = JSON.parse(JSON.stringify(manualPlayoffs));
      const pBracket = newPlayoffs[bracketKey];
      const match = pBracket.matches.find(m => (m.team1 + m.team2) === matchId || (m.team1 === matchId) || (m.team2 === matchId)); // loose id match as matches don't have unique IDs in playoffs structure initially, let's assume index or create logic
      // Actually matches in playoffs array don't have IDs. We need to find by teams.
      // Re-finding strategy:
      const matchIdx = pBracket.matches.findIndex(m => m.team1 === matchId || m.team2 === matchId || (m.team1 && m.team2 && (m.team1 + '-' + m.team2) === matchId));
      
      // Better approach: Assign IDs to playoff matches in manual mode init.
      // Let's assume we pass the match OBJECT index in the array from the UI for simplicity
      // Or just pass the match object ref? No, deep copy invalidates ref.
      // Let's look at `MatchMini` implementation inside `playoffs` map.
  };
  
  // Revised Playoff Pick Logic inside component map
  const executePlayoffPick = (bracketKey, matchIndex, winner) => {
      const newPlayoffs = JSON.parse(JSON.stringify(manualPlayoffs));
      const match = newPlayoffs[bracketKey].matches[matchIndex];
      match.winner = winner;
      if (winner === match.team1) { match.score1 = '✔'; match.score2 = ''; } else { match.score1 = ''; match.score2 = '✔'; }
      
      // Propagate in Bracket/Ladder
      // Bracket: 0 (semi1), 1 (semi2) -> 2 (final)
      // Ladder: 0 (semi), 1 (final)
      if (PLAYOFF_STRUCTURE[bracketKey].type === 'bracket') {
          if (matchIndex === 0) newPlayoffs[bracketKey].matches[2].team1 = winner;
          if (matchIndex === 1) newPlayoffs[bracketKey].matches[2].team2 = winner;
          if (matchIndex === 2) newPlayoffs[bracketKey].winner = winner; // Champ
      } else {
          // Ladder: [seed, semi1, semi2] inputs. 
          // Match 0 is Semi (teams[1] v teams[2]). Match 1 is Final (teams[0] v Winner 0)
          if (matchIndex === 0) newPlayoffs[bracketKey].matches[1].team2 = winner;
          if (matchIndex === 1) newPlayoffs[bracketKey].winner = winner;
      }
      
      setManualPlayoffs(newPlayoffs);
      
      // Trigger update of R32 sources based on new winner?
      // R32 sources are derived from `getGroupTeams`. `getGroupTeams` uses `GROUPS` constant.
      // We need to make `GROUPS` reactive to `manualPlayoffs`.
      updateR32Sources(newPlayoffs);
  };

  const updateR32Sources = (currentPlayoffs) => {
      // Reconstruct Groups based on new playoff winners
      const dynamicGroups = getGroupsWithWinners(currentPlayoffs);
      
      // Update manual bracket sources
      const newBracket = JSON.parse(JSON.stringify(manualBracket));
      
      // Helper
      const getGTeams = (gName) => dynamicGroups.find(g => g.name === gName)?.teams || [];
      const getMTeams = (str) => {
          let t = []; str.split('').forEach(k => t.push(...getGTeams(k))); return t;
      };

      if (newBracket.r32) {
          newBracket.r32.forEach(m => {
              if (m.source1) {
                  // Re-evaluate source based on match definition. We need to know original definition.
                  // We lost the 'g' and 't' (type) in previous map. Let's persist them in data.
                  // Quick fix: Re-map using original structure logic if available, or just update known placeholders?
                  // Better: Re-run r32 generation logic but keep selected teams if valid.
                  // Or, just update the source arrays in place.
                  // We need to know which group corresponds to which match.
                  // Let's rely on stored labels/ids to reverse engineer or store metadata.
                  // Storing metadata in r32 objects is best.
              }
          });
      }
      // Since managing deep update is complex, simpler is: user picks playoff winner -> it replaces placeholder in dropdown list.
      // We will re-generate `manualBracket`'s sources in the render or via effect, but keep selections.
      // Actually, we can just update `manualBracket` state with new sources.
      
      // Let's refresh sources
      // We need the original definitions to know which groups to pull from.
      // We'll add metadata to r32Matches in initialization.
      
      setManualBracket(prev => {
          const next = { ...prev };
          next.r32 = next.r32.map(m => {
              if (!m.meta) return m; // Should have meta
              const s1 = m.meta.s1.t === '3rd' ? getMTeams(m.meta.s1.g.replace(' ','')) : getGTeams(m.meta.s1.g);
              const s2 = m.meta.s2.t === '3rd' ? getMTeams(m.meta.s2.g.replace(' ','')) : getGTeams(m.meta.s2.g);
              
              // If current selection is no longer in source (e.g. placeholder changed to real team), keep it? 
              // No, if placeholder "Winner A" becomes "Wales", we should probably reset or auto-select Wales if it was selected?
              // Let's just update sources.
              return { ...m, source1: s1, source2: s2 };
          });
          return next;
      });
  };

  const getGroupsWithWinners = (playoffsState) => {
      // Helper to safely get winner or placeholder
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

  const runSimulation = () => {
    setShowWinnerPopup(false);
    
    // 1. Initialize Playoffs (Auto or Blank)
    let playoffResults = {};
    let qualifiedTeams = {}; 

    // Simulation Logic for Auto
    const runUefaBracket = (key, teams) => {
        const semi1 = simulateMatch(teams[0], teams[3], simMode, true);
        const semi2 = simulateMatch(teams[1], teams[2], simMode, true);
        const final = simulateMatch(semi1.winner, semi2.winner, simMode, true);
        return { name: PLAYOFF_STRUCTURE[key].name, matches: [semi1, semi2, final], winner: final.winner };
    };
    const runInterLadder = (key, teams) => {
        const semi = simulateMatch(teams[1], teams[2], simMode, true);
        const final = simulateMatch(teams[0], semi.winner, simMode, true);
        return { name: PLAYOFF_STRUCTURE[key].name, matches: [semi, final], winner: final.winner };
    };

    // Initialize Manual Playoffs (Blank)
    const initManualPlayoff = (key, type, teams) => {
        let matches = [];
        if (type === 'bracket') {
            matches = [
                { id: `${key}-s1`, team1: teams[0], team2: teams[3], winner: null, score1: '', score2: '' },
                { id: `${key}-s2`, team1: teams[1], team2: teams[2], winner: null, score1: '', score2: '' },
                { id: `${key}-f`, team1: null, team2: null, winner: null, score1: '', score2: '' } // Teams depend on semis
            ];
        } else {
            matches = [
                { id: `${key}-s`, team1: teams[1], team2: teams[2], winner: null, score1: '', score2: '' },
                { id: `${key}-f`, team1: teams[0], team2: null, winner: null, score1: '', score2: '' }
            ];
        }
        return { name: PLAYOFF_STRUCTURE[key].name, matches, winner: null };
    };

    if (simMode === MODES.MANUAL) {
        playoffResults['uefa_a'] = initManualPlayoff('uefa_a', 'bracket', PLAYOFF_STRUCTURE.uefa_a.teams);
        playoffResults['uefa_b'] = initManualPlayoff('uefa_b', 'bracket', PLAYOFF_STRUCTURE.uefa_b.teams);
        playoffResults['uefa_c'] = initManualPlayoff('uefa_c', 'bracket', PLAYOFF_STRUCTURE.uefa_c.teams);
        playoffResults['uefa_d'] = initManualPlayoff('uefa_d', 'bracket', PLAYOFF_STRUCTURE.uefa_d.teams);
        playoffResults['inter_a'] = initManualPlayoff('inter_a', 'ladder', PLAYOFF_STRUCTURE.inter_a.teams);
        playoffResults['inter_b'] = initManualPlayoff('inter_b', 'ladder', PLAYOFF_STRUCTURE.inter_b.teams);
        setManualPlayoffs(playoffResults);
        
        // Manual mode initially has no qualified teams from playoffs
        qualifiedTeams = { uefa_a: null, uefa_b: null, uefa_c: null, uefa_d: null, inter_a: null, inter_b: null };
    } else {
        // Auto
        playoffResults['uefa_a'] = runUefaBracket('uefa_a', PLAYOFF_STRUCTURE.uefa_a.teams);
        playoffResults['uefa_b'] = runUefaBracket('uefa_b', PLAYOFF_STRUCTURE.uefa_b.teams);
        playoffResults['uefa_c'] = runUefaBracket('uefa_c', PLAYOFF_STRUCTURE.uefa_c.teams);
        playoffResults['uefa_d'] = runUefaBracket('uefa_d', PLAYOFF_STRUCTURE.uefa_d.teams);
        playoffResults['inter_a'] = runInterLadder('inter_a', PLAYOFF_STRUCTURE.inter_a.teams);
        playoffResults['inter_b'] = runInterLadder('inter_b', PLAYOFF_STRUCTURE.inter_b.teams);
        
        Object.keys(playoffResults).forEach(k => qualifiedTeams[k] = playoffResults[k].winner);
    }

    // 2. Groups
    const getW = (k) => qualifiedTeams[k] || `Ganador ${PLAYOFF_STRUCTURE[k].name}`;
    const GROUPS = [
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

    // Sim Group Stage (For Auto Mode stats)
    let groupResults = {};
    GROUPS.forEach(g => { groupResults[g.name] = g.teams.map(t => ({ name: t, points: 0, gf: 0, ga: 0, wins: 0, draws: 0, losses: 0, group: g.name })); });
    if (simMode !== MODES.MANUAL) {
        GROUPS.forEach(g => {
            const teams = g.teams;
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const t1 = teams[i]; const t2 = teams[j];
                    const result = simulateMatch(t1, t2, simMode, false);
                    const s1 = groupResults[g.name].find(t => t.name === t1);
                    const s2 = groupResults[g.name].find(t => t.name === t2);
                    s1.gf += result.score1; s1.ga += result.score2;
                    s2.gf += result.score2; s2.ga += result.score1;
                    if (result.score1 > result.score2) { s1.points += 3; s1.wins++; s2.losses++; }
                    else if (result.score2 > result.score1) { s2.points += 3; s2.wins++; s1.losses++; }
                    else { s1.points += 1; s2.points += 1; s1.draws++; s2.draws++; }
                }
            }
            groupResults[g.name].sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return (b.gf - b.ga) - (a.gf - a.ga);
            });
        });
    }

    // Bracket Init
    const r32Structure = [
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

    // Helpers for Auto
    const getPos = (gName, p) => groupResults[gName][p-1].name;
    let autoThirds = []; 
    if(simMode !== MODES.MANUAL) {
        GROUPS.forEach(g => autoThirds.push({ ...groupResults[g.name][2], group: g.name }));
        autoThirds.sort((a,b) => (b.points - a.points) || ((b.gf-b.ga) - (a.gf-a.ga)));
    }
    const getAuto3rd = (allowed, used) => {
        let c = autoThirds.slice(0,8).find(t => allowed.includes(t.group) && !used.includes(t.name));
        if(!c) c = autoThirds.slice(0,8).find(t => !used.includes(t.name));
        if(c) { used.push(c.name); return c.name; }
        return 'TBD';
    };
    let usedAuto3rds = [];

    // Manual Helper
    const getManualTeams = (str) => {
        let t = []; str.split('').forEach(k => t.push(...GROUPS.find(g => g.name === k).teams)); return t;
    };

    let r32 = r32Structure.map(d => {
        let t1, t2, s1, s2;
        if (simMode === MODES.MANUAL) {
            t1 = null; t2 = null;
            // For Manual, source comes from the GROUPS array which now contains "Ganador..." placeholders.
            // These placeholders will be dynamically updated in `updateR32Sources` as user picks playoff winners.
            s1 = d.s1.t === '3rd' ? getManualTeams(d.s1.g.replace(' ','')) : GROUPS.find(g => g.name === d.s1.g).teams;
            s2 = d.s2.t === '3rd' ? getManualTeams(d.s2.g.replace(' ','')) : GROUPS.find(g => g.name === d.s2.g).teams;
        } else {
            t1 = d.s1.t === '3rd' ? getAuto3rd(d.s1.g, usedAuto3rds) : getPos(d.s1.g, d.s1.p || 2);
            t2 = d.s2.t === '3rd' ? getAuto3rd(d.s2.g, usedAuto3rds) : getPos(d.s2.g, d.s2.p || 2);
        }
        const res = simulateMatch(t1, t2, simMode, true);
        return { 
            id: d.id, stadium: d.stadium, team1: t1, team2: t2, 
            score1: res.score1, score2: res.score2, winner: res.winner,
            label1: d.label1, label2: d.label2, source1: s1, source2: s2, meta: d 
        };
    });

    // Generate rest of bracket (Auto or Blank)
    const generateNextRound = (prevRound, defs) => defs.map(d => {
        const w1 = prevRound.find(m => m.id === d.s1)?.winner;
        const w2 = prevRound.find(m => m.id === d.s2)?.winner;
        return { ...simulateMatch(w1, w2, simMode, true), ...d };
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

    let r16 = generateNextRound(r32, r16Defs);
    let qf = generateNextRound(r16, qfDefs);
    let sf = generateNextRound(qf, sfDefs);
    
    const getL = (matches, id) => { const m = matches.find(x => x.id === id); return m.winner === m.team1 ? m.team2 : m.team1; };
    const wSf1 = sf.find(m => m.id === 101)?.winner; const wSf2 = sf.find(m => m.id === 102)?.winner;
    const lSf1 = getL(sf, 101); const lSf2 = getL(sf, 102);

    const third = { ...simulateMatch(lSf1, lSf2, simMode, true), id: 103, stadium: 'Miami', stage: '3er Puesto' };
    const final = { ...simulateMatch(wSf1, wSf2, simMode, true), id: 104, stadium: 'NY/NJ', stage: 'FINAL' };

    const generatedBracket = { r32, r16, qf, sf, third, final: [final] };

    setSimulation({ playoffs: playoffResults, groups: groupResults, bracket: generatedBracket });
    
    if (simMode === MODES.MANUAL) {
        setIsManualMode(true);
        setManualBracket(JSON.parse(JSON.stringify(generatedBracket))); // Blank due to logic above
        setActiveTab('playoffs'); // Start at playoffs
    } else {
        setIsManualMode(false);
        setManualBracket(JSON.parse(JSON.stringify(generatedBracket)));
        setActiveTab('playoffs');
    }
  };

  const displayBracket = isManualMode ? manualBracket : (simulation?.bracket || {});
  const displayPlayoffs = isManualMode ? manualPlayoffs : (simulation?.playoffs || {});
  
  const selectedTeamsR32 = isManualMode && manualBracket.r32 ? manualBracket.r32.flatMap(m => [m.team1, m.team2].filter(Boolean)) : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Mundial 2026 Simulator</h1>
                <p className="text-emerald-200 text-sm">48 Equipos | Simulación & Prode Interactivo</p>
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
            <button onClick={runSimulation} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"><Play className="w-5 h-5" fill="currentColor" />{simulation ? 'Reiniciar' : 'Comenzar'}</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {!simulation && (
          <div className="text-center py-20 text-slate-400">
            <Trophy className="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p className="text-xl">Elige un modo y presiona "Comenzar" para generar el torneo.</p>
          </div>
        )}

        {simulation && (
          <>
            <div className="flex flex-col md:flex-row border-b border-slate-200 mb-6 gap-2 md:gap-0">
              <div className="flex overflow-x-auto">
                <button onClick={() => setActiveTab('playoffs')} className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'playoffs' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500'}`}>1. Repechajes</button>
                <button onClick={() => setActiveTab('groups')} className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'groups' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500'}`}>2. Grupos</button>
                <button onClick={() => setActiveTab('bracket')} className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'bracket' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500'}`}>3. Fase Final</button>
              </div>
              
              {activeTab === 'bracket' && (
                  <div className="ml-auto flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsManualMode(!isManualMode)}>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isManualMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isManualMode ? 'translate-x-4' : ''}`} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 select-none flex items-center gap-1">
                              {isManualMode ? <MousePointerClick className="w-4 h-4"/> : null} 
                              {isManualMode ? 'Modo: Mi Pronóstico' : 'Modo: Automático'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                {simulation.groups && Object.keys(simulation.groups).map(g => (
                  <GroupCard key={g} group={{name: g}} standings={simulation.groups[g]} />
                ))}
              </div>
            )}

            {activeTab === 'bracket' && (
              <div id="bracket-export" className="space-y-8 animate-fadeIn pb-20 bg-slate-50 p-4 rounded-xl">
                
                {isManualMode && (
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-center text-sm font-medium border border-blue-100 flex items-center justify-center gap-2 animate-pulse">
                        <MousePointerClick className="w-4 h-4" />
                        Modo Pronóstico Activo: Elige los equipos en los 16vos y luego haz clic para avanzar ganadores.
                    </div>
                )}

                {/* Champion */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-2xl p-6 text-center shadow-sm max-w-2xl mx-auto">
                  <h2 className="text-amber-800 text-xs font-bold uppercase tracking-widest mb-2">Campeón del Mundo 2026</h2>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Award className="w-12 h-12 text-yellow-500" />
                    <div className="text-3xl font-black text-slate-900 flex items-center gap-4">
                       <TeamWithFlag name={displayBracket.final[0]?.winner} big={true} className="text-3xl" />
                    </div>
                  </div>
                </div>

                {/* Final & 3rd */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/> La Gran Final</h3>
                        <div className="w-full max-w-sm">
                            <InteractiveMatchCard match={displayBracket.final[0]} isFinal={true} onPick={handleManualPick} isManual={isManualMode} onSelectTeam={handleManualSelect} />
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
                                 {round.data.map(m => (
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