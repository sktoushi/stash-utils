function handleSkywayLink(sel, pickFn){
  if(sel.length>=4 && /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(sel[2])){
    const seg=parseInt(sel[3],10);
    if(!isNaN(seg) && seg>1){
      const qs=new URLSearchParams();
      qs.set('video',sel[2]);
      qs.set('segments',seg);
      const defUrl='looptube.html?'+qs.toString();
      const picked=typeof pickFn==='function'?pickFn():null;
      return picked||defUrl;
    }
  }
  return sel[2];
}
