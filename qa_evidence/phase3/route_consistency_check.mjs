import fs from "node:fs";
const src = fs.readFileSync("src/seo.js","utf8");
const arr = src.match(/export const KNOWN_APP_ROUTES = (\[[\s\S]*?\]);/)[1];
const KNOWN_APP_ROUTES = eval(arr);
const seo = { KNOWN_APP_ROUTES, isKnownAppPath: p => KNOWN_APP_ROUTES.some(r => r.test(p)) };
const fb = JSON.parse(fs.readFileSync("firebase.json","utf8")).hosting.rewrites.map(r => new RegExp(r.regex));
const paths = ["/","/index.html","/products/x","/products/x/","/privacy","/refund/","/admin","/admin/","/admin/a/b","/admin-login","/reset-password","/reset-password/t","/verify-email","/verify-email/","/orders","/orders/1","/orders/1/tracking","/cart","/signup/","/nope","/products","/products/a/b","/adminx","/orders/abc","/orders/1/tracking/x","/privacy/x","/x.php","/cart/x"];
let bad=0; for (const p of paths){ const a=seo.isKnownAppPath(p), b=fb.some(r=>r.test(p)); if(a!==b){bad++;console.log("MISMATCH",p,a,b)} }
console.log("checked",paths.length,"mismatches",bad);
