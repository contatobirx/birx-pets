const H={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
export async function onRequest({env}){
  return new Response(JSON.stringify({
    ok:true,
    nfc_master_key_presente:typeof env.NFC_MASTER_KEY==='string'&&env.NFC_MASTER_KEY.length>0,
    tag_admin_token_presente:typeof env.TAG_ADMIN_TOKEN==='string'&&env.TAG_ADMIN_TOKEN.length>0,
    db_presente:!!env.DB,
    nfc_master_key_tipo:typeof env.NFC_MASTER_KEY,
    tag_admin_token_tipo:typeof env.TAG_ADMIN_TOKEN
  }),{headers:H});
}