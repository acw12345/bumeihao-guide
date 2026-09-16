import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const data=JSON.parse(fs.readFileSync(path.join(root,'app','combined-data.json'),'utf8'));
const canonical=value=>value.replace(/^[\d①②③④⑤⑥⑦⑧⑨⑩⓪~～\-—\s]+/,'').replace(/旧十年/g,'旧十').replace(/[\s·・]/g,'').toLowerCase();
const duplicateValues=values=>[...new Set(values.filter((value,index)=>values.indexOf(value)!==index))];
const fileExists=url=>!url||fs.existsSync(path.join(root,'public',url.replace(/^\//,'')));

const families=new Map(data.families.map(family=>[family.slug,family]));
const routesByFamily=new Map();
for(const route of data.routes){
  const list=routesByFamily.get(route.familySlug)??[];
  list.push(route);
  routesByFamily.set(route.familySlug,list);
}

const duplicateIds=duplicateValues(data.routes.map(route=>route.id));
const duplicateNames=duplicateValues(data.routes.map(route=>route.name));
const missingFamilies=data.routes.filter(route=>!families.has(route.familySlug)).map(route=>route.name);
const emptyRoutes=data.routes.filter(route=>!route.routeSteps?.length&&!(route.routeVariants??[]).some(variant=>variant.steps?.length)).map(route=>route.name);
const missingTalentLinks=data.talents.filter(talent=>talent.routeId&&!data.routes.some(route=>route.id===talent.routeId)).map(talent=>talent.name);
const missingRouteImages=data.routes.filter(route=>!fileExists(route.image)).map(route=>`${route.name}: ${route.image}`);
const missingStepImages=data.routes.flatMap(route=>[...route.routeSteps,...(route.routeVariants??[]).flatMap(variant=>variant.steps)].filter(step=>step.image&&!fileExists(step.image)).map(step=>`${route.name} → ${step.name}: ${step.image}`));
const unresolved=data.routes.filter(route=>route.coverage==='条件待确认'||route.reviewUnresolved).map(route=>route.name);
const noteMismatches=[];
for(const family of data.families){
  const routeTitles=new Set((routesByFamily.get(family.slug)??[]).map(route=>canonical(route.name)));
  for(const note of family.notes??[]){
    if(!routeTitles.has(canonical(note.title)))noteMismatches.push(`${family.name} → ${note.title}`);
  }
}

const report={
  totals:{families:data.families.length,routes:data.routes.length,talents:data.talents.length,characters:data.characters.length},
  duplicateIds,duplicateNames,missingFamilies,emptyRoutes,missingTalentLinks,missingRouteImages,missingStepImages,noteMismatches,
  unresolvedCount:unresolved.length,
  unresolved
};
console.log(JSON.stringify(report,null,2));
if(duplicateIds.length||missingFamilies.length||emptyRoutes.length||missingTalentLinks.length||missingRouteImages.length||missingStepImages.length)process.exitCode=1;
