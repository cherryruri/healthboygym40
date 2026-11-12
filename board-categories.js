import { doc, getDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

export const isCustomCategory = value => /^custom_[a-f0-9-]{36}$/.test(value);

function categorySettings(db, scope){
  return doc(db, "siteSettings", scope === "info" ? "infoBoardCategories" : "publicBoardCategories");
}

function readCategories(snapshot){
  const items = snapshot.data()?.items;
  return (Array.isArray(items) ? items : []).filter(item=>
    item && isCustomCategory(item.id) && typeof item.label === "string" && item.label.length <= 24
  );
}

export async function loadBoardCategories(db, includeInfo = false){
  const [publicCategories, info] = await Promise.all([
    getDoc(categorySettings(db, "public")).then(readCategories),
    includeInfo ? getDoc(categorySettings(db, "info")).then(readCategories).catch(error=>{
      console.warn("인포게시판 분류를 불러오지 못했습니다.", error);
      return [];
    }) : []
  ]);
  return {public:publicCategories, info};
}

export async function changeBoardCategory(db, scope, change){
  const ref = categorySettings(db, scope);
  return runTransaction(db, async transaction=>{
    const items = change(readCategories(await transaction.get(ref)));
    transaction.set(ref, {items});
    return items;
  });
}
