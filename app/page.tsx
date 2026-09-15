'use client';

import {useEffect,useMemo,useState} from 'react';
import {AlertTriangle,ChevronRight,HardDrive,ListFilter,Route as RouteIcon,Search,Swords,UserRound,X} from 'lucide-react';
import data from './combined-data.json';

type View='routes'|'talents'|'characters';
type RankItem={rank:string;name:string;slots:string;summary:string;image:string;routeId:string;familySlug:string};
type Step={name:string;kind:string;condition:string;effect:string;image:string};
type TalentRoute={id:string;name:string;rank:string;slots:string;summary:string;image:string;familySlug:string;familyName:string;coverage:string;routeSteps:Step[];routeVariants?:{title:string;steps:Step[];unresolved:string}[];reviewNote:string;reviewSource:string;reviewGaps:string[];reviewUnresolved:string;reviewIssues:string[]};
type Character={rank:string;name:string;summary:string;analysis:{title:string;label:string;text:string}[];builds:{title:string;label:string;text:string}[]};
type Family={slug:string;notes:{title:string;tags:string;text:string}[]};
const routes=data.routes as unknown as TalentRoute[];
const talents=data.talents as RankItem[];
const characters=data.characters as Character[];
const families=data.families as unknown as Family[];
const rankOrder=['论外','？？？','EX','S','A','B','C','D','E'];
const rankTone:Record<string,string>={'论外':'rank-out','？？？':'rank-out',EX:'rank-ex',S:'rank-s',A:'rank-a',B:'rank-b',C:'rank-c',D:'rank-d',E:'rank-e'};
function Rank({value}:{value:string}){return <span className={`rank ${rankTone[value]??'rank-none'}`}>{value||'—'}</span>}
function includes(text:string,q:string){return text.toLowerCase().includes(q.trim().toLowerCase())}

function RouteSteps({route}:{route:TalentRoute}){
  return <section className="route-unit">
    <div className="section-title"><div><span>原文分支记录 · 占格数不决定步骤数</span><h2>{route.name} 拿卡与条件</h2></div><small>{route.routeSteps.length?`${route.routeSteps.length} 个步骤／条件`:'旧错误链条已撤下'}</small></div>
    <div className="review-summary"><b>{route.coverage}</b>
      {route.reviewNote&&<p>{route.reviewNote}</p>}
      {route.reviewUnresolved&&<p className="review-warning"><AlertTriangle/>{route.reviewUnresolved}</p>}
      {route.reviewGaps.length>0&&<details><summary>本路线有 {route.reviewGaps.length} 项卡图待核对</summary><p>{route.reviewGaps.join('、')}</p></details>}
      {route.reviewSource&&<small>核对依据：{route.reviewSource}</small>}
    </div>
    {[{title:'',steps:route.routeSteps,unresolved:''},...(route.routeVariants??[])].filter(group=>group.steps.length>0).map((group,g)=><section key={g} className="route-variant">
    {group.title&&<h3>{group.title} · 独立完整分支</h3>}
    {group.unresolved&&<p className="review-warning">{group.unresolved}</p>}
    <div className="route-chain reviewed-chain">{group.steps.map((step,index)=><div className="chain-row" key={`${step.name}-${index}`}>
      <div className="chain-line"><span>{index+1}</span></div><article className="route-card">
        {step.image?<img src={step.image} alt={`${step.name} 卡图`} loading={index<5?'eager':'lazy'}/>:<div className="step-symbol"><RouteIcon/><small>{!['入口','抽卡','自动加入','进化','概率加入','概率进化','不占格事件','道具'].includes(step.kind)?'条件／分支':'卡图待核对'}</small></div>}
        <div><header><h3>{step.name}</h3><span className="step-kind">{step.kind}</span></header><div className="review-step-copy">{step.condition&&<p>{step.condition}</p>}{step.effect&&<p className="step-effect"><b>效果：</b>{step.effect}</p>}</div></div>
      </article>
    </div>)}</div></section>)}
    <details className="review-details"><summary>本终端复核记录</summary><ul>{route.reviewIssues.map((issue,i)=><li key={i}>{issue}</li>)}</ul></details>
  </section>
}
export default function Home(){
  const [view,setView]=useState<View>('routes');
  const [query,setQuery]=useState('');
  const [routeId,setRouteId]=useState(routes.find(r=>r.name==='魔法少女鹿目圆')?.id??routes[0].id);
  const [characterName,setCharacterName]=useState(characters[0].name);
  const currentRoute=routes.find(r=>r.id===routeId)??routes[0];
  const currentCharacter=characters.find(c=>c.name===characterName)??characters[0];
  const currentFamily=families.find(f=>f.slug===currentRoute.familySlug);
  const notes=(currentFamily?.notes??[]).filter(n=>includes(n.title,currentRoute.name.replace(/^.*?[-—]/,'')));
  const siblings=routes.filter(r=>r.familySlug===currentRoute.familySlug&&r.id!==currentRoute.id);
  const filteredRoutes=useMemo(()=>routes.filter(r=>!query.trim()||includes(`${r.name} ${r.rank} ${r.familyName} ${r.summary} ${r.coverage}`,query)),[query]);
  const filteredTalents=useMemo(()=>talents.filter(r=>!query.trim()||includes(`${r.name} ${r.rank} ${r.summary} ${r.slots}`,query)),[query]);
  const filteredCharacters=useMemo(()=>characters.filter(r=>!query.trim()||includes(`${r.name} ${r.rank} ${r.summary} ${r.analysis.map(x=>x.text).join(' ')}`,query)),[query]);
  useEffect(()=>{if(view==='routes'&&filteredRoutes.length&&!filteredRoutes.some(r=>r.id===routeId))setRouteId(filteredRoutes[0].id)},[view,filteredRoutes,routeId]);
  useEffect(()=>{if(view==='characters'&&filteredCharacters.length&&!filteredCharacters.some(r=>r.name===characterName))setCharacterName(filteredCharacters[0].name)},[view,filteredCharacters,characterName]);
  function openRoute(item:RankItem|TalentRoute){setRouteId('id' in item?item.id:item.routeId);setView('routes');setQuery('');window.scrollTo({top:0,behavior:'auto'})}
  return <main>
    <header className="topbar"><div className="topbar-inner">
      <div className="brand"><RouteIcon/><span><b>不美好的一天攻略站</b><small>本地路线 · 原文复核版</small></span></div>
      <nav className="view-tabs" aria-label="攻略分类">{([['routes','终端路线',RouteIcon],['talents','天赋排行',Swords],['characters','机体排行',UserRound]] as const).map(([key,label,Icon])=><button key={key} className={view===key?'active':''} onClick={()=>{setView(key);setQuery('')}}><Icon/>{label}</button>)}</nav>
      <div className="search-wrap"><Search/><input aria-label="搜索攻略" value={query} onChange={e=>setQuery(e.target.value)} placeholder={view==='characters'?'搜索机体或技能…':'搜索天赋、评级或说明…'}/>{query&&<button onClick={()=>setQuery('')} aria-label="清空"><X/></button>}</div><span className="offline"><HardDrive/>本地</span>
    </div></header>
    {view==='routes'&&<div className="workspace">
      <aside className="rail"><div className="rail-title"><span><ListFilter/>终端路线</span><small>{filteredRoutes.length}/{routes.length}</small></div><div className="rail-list">{filteredRoutes.map(r=><button key={r.id} className={r.id===currentRoute.id?'selected':''} onClick={()=>openRoute(r)}><img className="rail-image" src={r.image} alt="" loading="lazy"/><Rank value={r.rank}/><span><b>{r.name}</b><small>{r.coverage} · {r.slots} 格</small></span><ChevronRight/></button>)}</div></aside>
      <section className="content">
        <div className="audit-banner"><AlertTriangle/><p>{data.routeAudit.transcribed} 个终端已重新核对原页。标为“条件待确认”的路线仍有不明确条件；缺失卡图单独标注。Excel 占格数与事件／进化步骤数分开显示。</p></div>
        <div className="terminal-hero"><img src={currentRoute.image} alt={`${currentRoute.name} Excel 原图`}/><div className="terminal-title"><div className="title-line"><Rank value={currentRoute.rank}/><span>{currentRoute.familyName} · 指定终端</span></div><h1>{currentRoute.name}</h1><p>{currentRoute.summary}</p></div><div className="route-stats"><span><b>{currentRoute.routeSteps.length||'待核对'}</b>步骤／条件</span><span><b>{currentRoute.slots}</b>Excel 占格标注</span><span className="coverage-state warn"><b>{currentRoute.coverage}</b>不按卡数推算占格</span></div></div>
        <RouteSteps route={currentRoute}/>
        {notes.length>0&&<section className="route-unit"><div className="section-title"><h2>Excel 对本终端的补充说明</h2></div><div className="text-records">{notes.map((n,i)=><article key={i}><header><b>{n.title}</b><span>{n.tags}</span></header><p>{n.text}</p></article>)}</div></section>}
        {siblings.length>0&&<section className="sibling-routes"><header>同系列其他终端（独立路线）</header><div>{siblings.map(r=><button key={r.id} onClick={()=>openRoute(r)}><img src={r.image} alt="" loading="lazy"/><span><Rank value={r.rank}/><b>{r.name}</b><small>{r.coverage} · {r.slots} 格</small></span></button>)}</div></section>}
      </section>
    </div>}
    {view==='talents'&&<section className="ranking-page"><div className="ranking-head"><div><span>Excel 原始排序与嵌入图片</span><h1>天赋强度排行</h1><p>共 {talents.length} 项，评级不代表成型成本。点击“看路线”进入指定终端。</p></div><div className="rank-jumps">{rankOrder.map(rank=><a key={rank} href={`#talent-${encodeURIComponent(rank)}`}>{rank}</a>)}</div></div>{rankOrder.map(rank=>{const rows=filteredTalents.filter(r=>r.rank===rank);if(!rows.length)return null;return <section className="rank-group" id={`talent-${encodeURIComponent(rank)}`} key={rank}><header><Rank value={rank}/><h2>{rank} 级</h2><span>{rows.length} 项</span></header><div className="rank-table"><div className="rank-table-head"><span>天赋</span><span>占格</span><span>原评价</span><span/></div>{rows.map((r,i)=><div className="rank-row" key={`${r.name}-${i}`}><div><img className="rank-image" src={r.image} alt={`${r.name} 图标`} loading="lazy"/><Rank value={r.rank}/><b>{r.name}</b></div><span className="slot-cell">{r.slots}</span><p>{r.summary}</p><button disabled={!r.routeId} onClick={()=>openRoute(r)}>{r.routeId?'看路线':'暂无路线'}</button></div>)}</div></section>})}</section>}
    {view==='characters'&&<div className="workspace character-workspace"><aside className="rail"><div className="rail-title"><span><UserRound/>机体目录</span><small>{filteredCharacters.length}/{characters.length}</small></div><div className="rail-list">{filteredCharacters.map(c=><button key={c.name} className={c.name===currentCharacter.name?'selected':''} onClick={()=>setCharacterName(c.name)}><Rank value={c.rank}/><span><b>{c.name}</b><small>{c.summary}</small></span><ChevronRight/></button>)}</div></aside><section className="content"><div className="character-head"><Rank value={currentCharacter.rank}/><div><span>机体评级</span><h1>{currentCharacter.name}</h1><p>{currentCharacter.summary}</p></div></div><div className="character-body">{([['技能、强项和操作提示',currentCharacter.analysis],['推荐路线与玩法',currentCharacter.builds]] as const).map(([title,records])=><section key={title}><div className="section-title"><h2>{title}</h2></div>{records.length?<div className="text-records">{records.map((r,i)=><article key={i}><header><b>{r.title}</b><span>{r.label}</span></header><p>{r.text}</p></article>)}</div>:<p className="empty">原攻略未为该机体单列说明。</p>}</section>)}</div></section></div>}
  </main>
}
