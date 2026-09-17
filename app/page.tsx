'use client';

import {useEffect,useMemo,useState} from 'react';
import {AlertTriangle,ChevronRight,HardDrive,ListFilter,Route as RouteIcon,Search,Swords,UserRound,X} from 'lucide-react';
import data from './combined-data.json';

type View='routes'|'talents'|'characters';
type RankItem={rank:string;name:string;slots:string;summary:string;image:string;routeId:string;familySlug:string};
type Step={name:string;kind:string;condition:string;effect:string;image:string;aliases?:string[]};
type TalentRoute={id:string;name:string;rank:string;slots:string;summary:string;image:string;familySlug:string;familyName:string;coverage:string;routeSteps:Step[];routeVariants?:{title:string;steps:Step[];unresolved:string}[];variantLabel?:string;reviewNote:string;reviewSource:string;reviewGaps:string[];reviewUnresolved:string;reviewIssues:string[]};
type TextRecord={title:string;label:string;text:string};
type Character={rank:string;name:string;summary:string;analysis:TextRecord[];builds:TextRecord[]};
type Family={slug:string;notes:{title:string;tags:string;text:string}[]};
type NoteGroup={title:string;paragraphs:string[]};

const routes=data.routes as unknown as TalentRoute[];
const talents=data.talents as RankItem[];
const characters=data.characters as Character[];
const families=data.families as unknown as Family[];
const verifiedRouteCount=routes.filter(route=>route.coverage==='顺序已核对'&&!route.reviewUnresolved).length;
const unresolvedRouteCount=routes.length-verifiedRouteCount;
const missingCardImageCount=routes.reduce((count,route)=>count+route.reviewGaps.length,0);
const rankOrder=['论外','？？？','EX','S','A','B','C','D','E'];
const rankTone:Record<string,string>={'论外':'rank-out','？？？':'rank-out',EX:'rank-ex',S:'rank-s',A:'rank-a',B:'rank-b',C:'rank-c',D:'rank-d',E:'rank-e'};
const scoreDimensions=['天赋相性','道中护航','后期能力','爆发能力','持续能力','上手易度'];
const scorePattern=/^(?:EX|S|A|B|C|D|E|\?{3}|？？？)$/i;

function Rank({value}:{value:string}){return <span className={`rank ${rankTone[value]??'rank-none'}`}>{value||'—'}</span>}
function includes(text:string,q:string){return text.toLowerCase().includes(q.trim().toLowerCase())}
function allSteps(route:TalentRoute){return [...route.routeSteps,...(route.routeVariants??[]).flatMap(variant=>variant.steps)]}
function routeSearchText(route:TalentRoute){return [route.name,route.rank,route.familyName,route.summary,route.coverage,...allSteps(route).flatMap(step=>[step.name,...(step.aliases??[]),step.condition,step.effect])].join(' ')}
function matchingCards(route:TalentRoute,q:string){if(!q.trim())return [];return allSteps(route).filter(step=>includes([step.name,...(step.aliases??[])].join(' '),q)).map(step=>step.name).filter((name,index,names)=>names.indexOf(name)===index)}
function canonicalRouteTitle(value:string){return value.replace(/^[\d①②③④⑤⑥⑦⑧⑨⑩⓪~～\-—\s]+/,'').replace(/旧十年/g,'旧十').replace(/[\s·・]/g,'').toLowerCase()}
function isMetricRecord(record:TextRecord){const value=record.text.trim();return scoreDimensions.includes(value)||scorePattern.test(value)}

function recordTitle(record:TextRecord){return record.label||(/^(?:说明|推荐|注意事项|核心思路)$/.test(record.title)?record.title:'补充说明')}
function groupRecords(records:TextRecord[],omitMetrics=false){
  const source=omitMetrics?records.filter(record=>!isMetricRecord(record)):records;
  const groups:NoteGroup[]=[];
  let current:NoteGroup|undefined;
  for(let index=0;index<source.length;index++){
    const value=source[index].text.trim();
    if(!value)continue;
    if(value==='天赋'&&source[index+1]?.text.trim()==='推荐'){
      current={title:'天赋推荐',paragraphs:[]};groups.push(current);index++;continue;
    }
    const heading=value.match(/^【([^】]+)】\s*([\s\S]*)$/);
    if(heading){current={title:heading[1],paragraphs:heading[2]?[heading[2]]:[]};groups.push(current);continue}
    if(!current){current={title:recordTitle(source[index]),paragraphs:[]};groups.push(current)}
    current.paragraphs.push(value);
  }
  return groups.filter(group=>group.paragraphs.length);
}

function CharacterScores({records}:{records:TextRecord[]}){
  const dimensions=records.map(record=>record.text.trim()).filter(value=>scoreDimensions.includes(value));
  const grades=records.map(record=>record.text.trim()).filter(value=>scorePattern.test(value));
  if(!dimensions.length&&!grades.length)return null;
  return <section className="score-summary" aria-label="六维评价整理">
    <header><div><span>原表评价整理</span><h2>六维评价</h2></div><small>原表只提取到 {grades.length} 个等级，不强行错配到具体维度</small></header>
    <div className="dimension-list">{scoreDimensions.map(dimension=><span key={dimension} className={dimensions.includes(dimension)?'present':''}>{dimension}</span>)}</div>
    <div className="grade-list"><b>可识别等级（按原表顺序）</b>{grades.length?grades.map((grade,index)=><Rank key={`${grade}-${index}`} value={grade}/>):<span>暂无可识别等级</span>}</div>
  </section>
}

function StructuredNotes({records,omitMetrics=false}:{records:TextRecord[];omitMetrics?:boolean}){
  const groups=groupRecords(records,omitMetrics);
  if(!groups.length)return <p className="empty">原攻略未为该机体单列说明。</p>;
  return <div className="structured-notes">{groups.map((group,index)=><section key={`${group.title}-${index}`}><h3>{group.title}</h3>{group.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</section>)}</div>
}

function RouteSteps({route}:{route:TalentRoute}){
  const stepSummary=route.routeVariants?.length?`${route.routeSteps.length} 个公共步骤／${route.routeVariants.length} 条终端分支`:`${route.routeSteps.length} 个步骤／条件`;
  return <section className="route-unit">
    <div className="section-title"><div><span>原文分支记录 · 占格数不决定步骤数</span><h2>{route.name} 拿卡与条件</h2></div><small>{route.routeSteps.length?stepSummary:'旧错误链条已撤下'}</small></div>
    <div className="review-summary"><b>{route.coverage}</b>
      {route.reviewNote&&<p>{route.reviewNote}</p>}
      {route.reviewUnresolved&&<p className="review-warning"><AlertTriangle/>{route.reviewUnresolved}</p>}
      {route.reviewGaps.length>0&&<details><summary>本路线有 {route.reviewGaps.length} 项卡图待核对</summary><p>{route.reviewGaps.join('、')}</p></details>}
      {route.reviewSource&&<small>核对依据：{route.reviewSource}</small>}
    </div>
    {[{title:'',steps:route.routeSteps,unresolved:''},...(route.routeVariants??[])].filter(group=>group.steps.length>0).map((group,g)=><section key={g} className="route-variant">
      {group.title&&<h3>{group.title} · {route.variantLabel??'独立完整分支'}</h3>}
      {group.unresolved&&<p className="review-warning">{group.unresolved}</p>}
      <div className="route-chain reviewed-chain">{group.steps.map((step,index)=><div className="chain-row" key={`${step.name}-${index}`}>
        <div className="chain-line"><span>{index+1}</span></div><article className="route-card">
          {step.image?<img src={step.image} alt={`${step.name} 卡图`} loading={index<5?'eager':'lazy'}/>:<div className="step-symbol"><RouteIcon/><small>{!['入口','抽卡','自动加入','进化','概率加入','概率进化','不占格事件','道具'].includes(step.kind)?'条件／分支':'卡图待核对'}</small></div>}
          <div><header><h3>{step.name}</h3><span className="step-kind">{step.kind}</span></header><div className="review-step-copy">{step.condition&&<p>{step.condition}</p>}{step.effect&&<p className="step-effect"><b>效果：</b>{step.effect}</p>}</div></div>
        </article>
      </div>)}</div>
    </section>)}
    <details className="review-details"><summary>本终端复核记录</summary><ul>{route.reviewIssues.map((issue,i)=><li key={i}>{issue}</li>)}</ul></details>
  </section>
}

export default function Home(){
  const [view,setView]=useState<View>('routes');
  const [query,setQuery]=useState('');
  const [routeId,setRouteId]=useState(routes.find(route=>route.name==='魔法少女鹿目圆')?.id??routes[0].id);
  const [characterName,setCharacterName]=useState(characters[0].name);
  const currentRoute=routes.find(route=>route.id===routeId)??routes[0];
  const currentCharacter=characters.find(character=>character.name===characterName)??characters[0];
  const currentFamily=families.find(family=>family.slug===currentRoute.familySlug);
  const notes=(currentFamily?.notes??[]).filter(note=>canonicalRouteTitle(note.title)===canonicalRouteTitle(currentRoute.name));
  const siblings=routes.filter(route=>route.familySlug===currentRoute.familySlug&&route.id!==currentRoute.id);
  const filteredRoutes=useMemo(()=>routes.filter(route=>!query.trim()||includes(routeSearchText(route),query)),[query]);
  const cardMatches=useMemo(()=>query.trim()?routes.map(route=>({route,cards:matchingCards(route,query)})).filter(result=>result.cards.length):[],[query]);
  const filteredTalents=useMemo(()=>talents.filter(item=>!query.trim()||includes(`${item.name} ${item.rank} ${item.summary} ${item.slots}`,query)),[query]);
  const filteredCharacters=useMemo(()=>characters.filter(character=>!query.trim()||includes(`${character.name} ${character.rank} ${character.summary} ${character.analysis.map(item=>item.text).join(' ')}`,query)),[query]);
  useEffect(()=>{if(view==='routes'&&filteredRoutes.length&&!filteredRoutes.some(route=>route.id===routeId))setRouteId(filteredRoutes[0].id)},[view,filteredRoutes,routeId]);
  useEffect(()=>{if(view==='characters'&&filteredCharacters.length&&!filteredCharacters.some(character=>character.name===characterName))setCharacterName(filteredCharacters[0].name)},[view,filteredCharacters,characterName]);
  function openRoute(item:RankItem|TalentRoute,preserveQuery=false){setRouteId('routeId' in item?item.routeId:item.id);setView('routes');if(!preserveQuery)setQuery('');window.scrollTo({top:0,behavior:'auto'})}
  return <main>
    <header className="topbar"><div className="topbar-inner">
      <div className="brand"><RouteIcon/><span><b>不美好的一天攻略站</b><small>本地路线 · 原文复核版</small></span></div>
      <nav className="view-tabs" aria-label="攻略分类">{([['routes','终端路线',RouteIcon],['talents','天赋排行',Swords],['characters','机体排行',UserRound]] as const).map(([key,label,Icon])=><button key={key} className={view===key?'active':''} onClick={()=>{setView(key);setQuery('')}}><Icon/>{label}</button>)}</nav>
      <div className="search-wrap"><Search/><input aria-label="搜索攻略" value={query} onChange={event=>setQuery(event.target.value)} placeholder={view==='characters'?'搜索机体或技能…':view==='routes'?'搜索终端或单卡，列出包含路线…':'搜索天赋、评级或说明…'}/>{query&&<button onClick={()=>setQuery('')} aria-label="清空"><X/></button>}</div><span className="offline"><HardDrive/>本地</span>
    </div></header>
    {view==='routes'&&<div className="workspace">
      <aside className="rail"><div className="rail-title"><span><ListFilter/>终端路线</span><small>{filteredRoutes.length}/{routes.length}</small></div><div className="rail-list">{filteredRoutes.map(route=>{const cards=matchingCards(route,query);return <button key={route.id} className={route.id===currentRoute.id?'selected':''} onClick={()=>openRoute(route,true)}><img className="rail-image" src={route.image} alt="" loading="lazy"/><Rank value={route.rank}/><span><b>{route.name}</b><small>{cards.length?`包含：${cards.join('、')}`:`${route.coverage} · ${route.slots} 格`}</small></span><ChevronRight/></button>})}</div></aside>
      <section className="content">
        {query.trim()&&<section className="card-search-results"><header><div><span>单卡路线检索</span><h2>“{query.trim()}”</h2></div><b>{cardMatches.length} 条包含路线</b></header>{cardMatches.length?<div>{cardMatches.map(({route,cards})=><button key={route.id} onClick={()=>openRoute(route,true)}><img src={route.image} alt=""/><span><strong>{route.name}</strong><small>{route.familyName} · {route.rank} · 包含：{cards.join('、')}</small></span><ChevronRight/></button>)}</div>:<p>{filteredRoutes.length?'未命中具体卡名；下方显示的是标题、条件或说明中的相关路线。':'没有找到包含这张卡的终端路线。'}</p>}</section>}
        <div className="audit-banner"><AlertTriangle/><p>{data.routeAudit.transcribed} 个终端均已录入：{verifiedRouteCount} 条顺序已核对，{unresolvedRouteCount} 条仍有条件待确认，另有 {missingCardImageCount} 项卡图待补。Excel 占格数与事件／进化步骤数分开显示，不再用占格数推算路线完整度。</p></div>
        <div className="terminal-hero"><img src={currentRoute.image} alt={`${currentRoute.name} Excel 原图`}/><div className="terminal-title"><div className="title-line"><Rank value={currentRoute.rank}/><span>{currentRoute.familyName} · 指定终端</span></div><h1>{currentRoute.name}</h1><p>{currentRoute.summary}</p></div><div className="route-stats"><span><b>{currentRoute.routeSteps.length||'待核对'}</b>{currentRoute.routeVariants?.length?`公共步骤／${currentRoute.routeVariants.length} 条终端分支`:'步骤／条件'}</span><span><b>{currentRoute.slots}</b>Excel 占格标注</span><span className="coverage-state warn"><b>{currentRoute.coverage}</b>不按卡数推算占格</span></div></div>
        <RouteSteps route={currentRoute}/>
        {notes.length>0&&<section className="route-unit"><div className="section-title"><h2>Excel 对本终端的补充说明</h2></div><div className="route-note-list">{notes.map((note,index)=><div key={index}><span>{note.tags}</span><p>{note.text}</p></div>)}</div></section>}
        {siblings.length>0&&<section className="sibling-routes"><header>同系列其他终端（独立路线）</header><div>{siblings.map(route=><button key={route.id} onClick={()=>openRoute(route)}><img src={route.image} alt="" loading="lazy"/><span><Rank value={route.rank}/><b>{route.name}</b><small>{route.coverage} · {route.slots} 格</small></span></button>)}</div></section>}
      </section>
    </div>}
    {view==='talents'&&<section className="ranking-page"><div className="ranking-head"><div><span>Excel 原始排序与嵌入图片</span><h1>天赋强度排行</h1><p>共 {talents.length} 项，评级不代表成型成本。点击“看路线”进入指定终端。</p></div><div className="rank-jumps">{rankOrder.map(rank=><a key={rank} href={`#talent-${encodeURIComponent(rank)}`}>{rank}</a>)}</div></div>{rankOrder.map(rank=>{const rows=filteredTalents.filter(item=>item.rank===rank);if(!rows.length)return null;return <section className="rank-group" id={`talent-${encodeURIComponent(rank)}`} key={rank}><header><Rank value={rank}/><h2>{rank} 级</h2><span>{rows.length} 项</span></header><div className="rank-table"><div className="rank-table-head"><span>天赋</span><span>占格</span><span>原评价</span><span/></div>{rows.map((item,index)=><div className="rank-row" key={`${item.name}-${index}`}><div><img className="rank-image" src={item.image} alt={`${item.name} 图标`} loading="lazy"/><Rank value={item.rank}/><b>{item.name}</b></div><span className="slot-cell">{item.slots}</span><p>{item.summary}</p><button disabled={!item.routeId} onClick={()=>openRoute(item)}>{item.routeId?'看路线':'暂无路线'}</button></div>)}</div></section>})}</section>}
    {view==='characters'&&<div className="workspace character-workspace"><aside className="rail"><div className="rail-title"><span><UserRound/>机体目录</span><small>{filteredCharacters.length}/{characters.length}</small></div><div className="rail-list">{filteredCharacters.map(character=><button key={character.name} className={character.name===currentCharacter.name?'selected':''} onClick={()=>setCharacterName(character.name)}><Rank value={character.rank}/><span><b>{character.name}</b><small>{character.summary}</small></span><ChevronRight/></button>)}</div></aside><section className="content"><div className="character-head"><Rank value={currentCharacter.rank}/><div><span>机体评级</span><h1>{currentCharacter.name}</h1><p>{currentCharacter.summary}</p></div></div><CharacterScores records={currentCharacter.analysis}/><div className="character-body"><section><div className="section-title"><h2>技能、强项和操作提示</h2></div><StructuredNotes records={currentCharacter.analysis} omitMetrics/></section><section><div className="section-title"><h2>推荐路线与玩法</h2></div><StructuredNotes records={currentCharacter.builds}/></section></div></section></div>}
  </main>
}
