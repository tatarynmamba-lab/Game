// public/assets/catalog-model.mjs
var defaultCategories = [{ id: "design", name: "\u0414\u0438\u0437\u0430\u0439\u043D \u0438 \u043C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433", icon: "star", color: "violet", description: "\u0411\u0440\u0435\u043D\u0434\u044B, \u0441\u0430\u0439\u0442\u044B \u0438 \u043F\u0440\u043E\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435" }, { id: "beauty", name: "\u041A\u0440\u0430\u0441\u043E\u0442\u0430 \u0438 \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u0435", icon: "heart", color: "pink", description: "\u0417\u0430\u0431\u043E\u0442\u0430 \u043E \u0441\u0435\u0431\u0435 \u0438 \u0441\u0432\u043E\u0451\u043C \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u0435" }, { id: "retail", name: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B \u0438 \u0442\u043E\u0432\u0430\u0440\u044B", icon: "shop", color: "amber", description: "\u0412\u0435\u0449\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043D\u0430\u0439\u0442\u0438" }, { id: "education", name: "\u041E\u0431\u0443\u0447\u0435\u043D\u0438\u0435", icon: "book", color: "blue", description: "\u041D\u043E\u0432\u044B\u0435 \u0437\u043D\u0430\u043D\u0438\u044F \u0438 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438" }, { id: "food", name: "\u0415\u0434\u0430 \u0438 \u0437\u0430\u0432\u0435\u0434\u0435\u043D\u0438\u044F", icon: "coffee", color: "orange", description: "\u041A\u043E\u0444\u0435\u0439\u043D\u0438, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u044B \u0438 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430" }, { id: "services", name: "\u0423\u0441\u043B\u0443\u0433\u0438 \u0438 \u0440\u0435\u043C\u043E\u043D\u0442", icon: "tools", color: "green", description: "\u041F\u043E\u043C\u043E\u0449\u044C \u0441 \u043F\u043E\u0432\u0441\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u043C\u0438 \u0437\u0430\u0434\u0430\u0447\u0430\u043C\u0438" }, { id: "it", name: "IT \u0438 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438", icon: "code", color: "cyan", description: "\u0426\u0438\u0444\u0440\u043E\u0432\u044B\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B \u0438 \u0440\u0435\u0448\u0435\u043D\u0438\u044F" }, { id: "other", name: "\u0414\u0440\u0443\u0433\u0438\u0435 \u0431\u0438\u0437\u043D\u0435\u0441\u044B", icon: "grid", color: "gray", description: "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0447\u0442\u043E-\u043D\u0438\u0431\u0443\u0434\u044C \u043D\u043E\u0432\u043E\u0435" }];
function validWebsite(value2) {
  const raw = String(value2 ?? "").trim();
  if (!raw) return "";
  try {
    if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) return "";
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname.includes(".") || url.hostname === "localhost") return "";
    return url.href;
  } catch {
    return "";
  }
}
function normalizeBusiness(data, availableCategories = defaultCategories) {
  const trim = (key2, max) => String(data[key2] ?? "").trim().slice(0, max);
  const title = trim("title", 100), description = trim("description", 1500), city = trim("city", 100), category = trim("category", 80), website = validWebsite(data.website);
  if (title.length < 2) throw new Error("\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0445\u043E\u0442\u044F \u0431\u044B 2 \u0441\u0438\u043C\u0432\u043E\u043B\u0430.");
  if (!availableCategories.some((c) => c.id === category)) throw new Error("\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437\u0434\u0435\u043B \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430.");
  if (description.length < 10) throw new Error("\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435: \u0445\u043E\u0442\u044F \u0431\u044B 10 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432.");
  if (String(data.website ?? "").trim() && !website) throw new Error("\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441 \u0441\u0430\u0439\u0442\u0430 \u0438\u043B\u0438 \u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u043E\u043B\u0435 \u043F\u0443\u0441\u0442\u044B\u043C.");
  return { title, description, city, category, website, published: data.published === true ? 1 : 0 };
}
var sectionIconOptions = [["star", "\u0417\u0432\u0435\u0437\u0434\u0430"], ["heart", "\u0421\u0435\u0440\u0434\u0446\u0435"], ["shop", "\u041C\u0430\u0433\u0430\u0437\u0438\u043D"], ["book", "\u041E\u0431\u0443\u0447\u0435\u043D\u0438\u0435"], ["coffee", "\u041A\u043E\u0444\u0435"], ["tools", "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B"], ["code", "\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438"], ["grid", "\u0421\u0435\u0442\u043A\u0430"], ["home", "\u0414\u043E\u043C"], ["user", "\u0427\u0435\u043B\u043E\u0432\u0435\u043A"], ["chat", "\u041E\u0431\u0449\u0435\u043D\u0438\u0435"], ["calendar", "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C"], ["camera", "\u041A\u0430\u043C\u0435\u0440\u0430"], ["photo", "\u0424\u043E\u0442\u043E"], ["place", "\u041C\u0435\u0441\u0442\u043E"], ["link", "\u0421\u0432\u044F\u0437\u0438"]].map(([id, label]) => ({ id, label }));
var sectionIcons = sectionIconOptions.map((i) => i.id);
var sectionColors = ["violet", "pink", "amber", "blue", "orange", "green", "cyan", "gray"];
function normalizeSections(input2) {
  if (!Array.isArray(input2) || input2.length < 1 || input2.length > 40) throw new Error("\u0412 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043E\u0442 1 \u0434\u043E 40 \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432.");
  const ids = /* @__PURE__ */ new Set(), names = /* @__PURE__ */ new Set();
  return input2.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u0440\u0430\u0437\u0434\u0435\u043B.");
    const id = String(item.id || ""), name = String(item.name || "").trim().replace(/\s+/g, " "), description = String(item.description || "").trim();
    if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(id) || ids.has(id)) throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0438\u043B\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0438\u0439\u0441\u044F \u0440\u0430\u0437\u0434\u0435\u043B.");
    if (name.length < 2 || name.length > 60) throw new Error("\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u0430 \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043E\u0442 2 \u0434\u043E 60 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432.");
    if (description.length < 3 || description.length > 200) throw new Error("\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u0430 \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043E\u0442 3 \u0434\u043E 200 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432.");
    const key2 = name.normalize("NFKC").toLocaleLowerCase("ru");
    if (names.has(key2)) throw new Error("\u0420\u0430\u0437\u0434\u0435\u043B \u0441 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435\u043C \xAB" + name + "\xBB \u0443\u0436\u0435 \u0435\u0441\u0442\u044C.");
    ids.add(id);
    names.add(key2);
    return { id, name, description, icon: sectionIcons.includes(item.icon) ? item.icon : "grid", color: sectionColors.includes(item.color) ? item.color : sectionColors[index % sectionColors.length] };
  });
}

// lib/api-shared.ts
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
var json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
function requireUser(user) {
  if (!user) throw new HttpError(401, "\u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C.");
  return user;
}
async function input(req) {
  try {
    const data = await req.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("object required");
    return data;
  } catch {
    throw new HttpError(400, "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0444\u043E\u0440\u043C\u044B.");
  }
}

// lib/business-api.ts
var baseColumns = "id,title,category,description,city,website,published,created_at,updated_at";
var logoColumn = "(SELECT id FROM business_media m WHERE m.business_id=businesses.id AND m.kind='logo' LIMIT 1) AS logo_id";
var defaultPage = { about: "", address: "", phone: "", email: "", hours: "" };
var mediaKey = (businessId, id) => `business-media/${businessId}/${id}`;
function imageType(bytes) {
  if (bytes.length < 16) return "";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)) return "image/png";
  if (new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return "";
}
function pageFields(raw) {
  const limits = { about: 1e4, address: 250, phone: 40, email: 200, hours: 250 };
  const page = { ...defaultPage };
  for (const key2 of Object.keys(limits)) {
    page[key2] = String(raw[key2] ?? "").trim();
    if (page[key2].length > limits[key2]) throw new HttpError(400, "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0434\u043B\u0438\u043D\u043D\u043E\u0435 \u043F\u043E\u043B\u0435: " + { about: "\u043E \u0431\u0438\u0437\u043D\u0435\u0441\u0435", address: "\u0430\u0434\u0440\u0435\u0441", phone: "\u0442\u0435\u043B\u0435\u0444\u043E\u043D", email: "\u043F\u043E\u0447\u0442\u0430", hours: "\u0447\u0430\u0441\u044B \u0440\u0430\u0431\u043E\u0442\u044B" }[key2]);
  }
  if (page.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(page.email)) throw new HttpError(400, "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u044B.");
  if (page.phone && !/^[+\d\s().-]{3,40}$/.test(page.phone)) throw new HttpError(400, "\u0422\u0435\u043B\u0435\u0444\u043E\u043D \u043C\u043E\u0436\u0435\u0442 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0446\u0438\u0444\u0440\u044B, \u043F\u0440\u043E\u0431\u0435\u043B\u044B, \u0441\u043A\u043E\u0431\u043A\u0438 \u0438 \u0437\u043D\u0430\u043A +.");
  return page;
}
async function handleBusinesses(req, user, { db, bucket }, path, readSections2) {
  const method = req.method, id = path[1];
  if (method === "GET" && path.length === 1) {
    const result = await db.prepare(`SELECT ${baseColumns},${logoColumn} FROM businesses WHERE published=1 ORDER BY created_at DESC LIMIT 1000`).all();
    return json({ businesses: result.results });
  }
  if (method === "GET" && id === "mine" && path.length === 2) {
    const account2 = requireUser(user);
    const result = await db.prepare(`SELECT ${baseColumns},${logoColumn} FROM businesses WHERE owner_id=? ORDER BY created_at DESC`).bind(account2.userId).all();
    return json({ businesses: result.results });
  }
  if (method === "GET" && id && id !== "mine") {
    const business = await db.prepare(`SELECT ${baseColumns},owner_id FROM businesses WHERE id=? AND (published=1 OR owner_id=?)`).bind(id, user?.userId || "").first();
    if (!business) throw new HttpError(404, "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u0431\u0438\u0437\u043D\u0435\u0441\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430 \u0438\u043B\u0438 \u0435\u0449\u0451 \u043D\u0435 \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u0430.");
    const canEdit = Boolean(user && business.owner_id === user.userId);
    delete business.owner_id;
    if (path.length === 2) {
      const [page, media, posts] = await Promise.all([
        db.prepare("SELECT about,address,phone,email,hours FROM business_pages WHERE business_id=?").bind(id).first(),
        db.prepare("SELECT id,kind,created_at FROM business_media WHERE business_id=? ORDER BY created_at DESC").bind(id).all(),
        db.prepare("SELECT id,body,created_at,updated_at FROM business_posts WHERE business_id=? ORDER BY created_at DESC LIMIT 200").bind(id).all()
      ]);
      return json({ business: { ...business, ...defaultPage, ...page }, media: media.results, posts: posts.results, canEdit });
    }
    if (path[2] === "media" && path.length === 4) {
      if (!bucket) throw new HttpError(503, "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0435\u0449\u0451 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F.");
      const media = await db.prepare("SELECT object_key,content_type,size FROM business_media WHERE id=? AND business_id=?").bind(path[3], id).first();
      if (!media) throw new HttpError(404, "\u0424\u043E\u0442\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.");
      const object = await bucket.get(media.object_key);
      if (!object) throw new HttpError(404, "\u0424\u043E\u0442\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.");
      return new Response(object.body, { headers: { "Content-Type": media.content_type, "Content-Length": String(media.size), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" } });
    }
    throw new HttpError(404, "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441.");
  }
  const account = requireUser(user);
  if (method === "POST" && path.length === 1) {
    const config = await readSections2();
    let data;
    try {
      data = normalizeBusiness(await input(req), config.categories);
    } catch (e) {
      throw new HttpError(400, e.message);
    }
    const count = await db.prepare("SELECT COUNT(*) AS count FROM businesses WHERE owner_id=?").bind(account.userId).first();
    if (count.count >= 20) throw new HttpError(400, "\u041C\u043E\u0436\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u0435 \u0431\u043E\u043B\u044C\u0448\u0435 20 \u0431\u0438\u0437\u043D\u0435\u0441\u043E\u0432 \u0432 \u043E\u0434\u043D\u043E\u043C \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0435.");
    const createdId = crypto.randomUUID(), now = Date.now();
    await db.prepare("INSERT INTO businesses(id,owner_id,title,category,description,city,website,published,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(createdId, account.userId, data.title, data.category, data.description, data.city, data.website, data.published, now, now).run();
    return json({ id: createdId, ...data, pageUrl: "/business/" + createdId }, 201);
  }
  const owned = id ? await db.prepare("SELECT id,published FROM businesses WHERE id=? AND owner_id=?").bind(id, account.userId).first() : null;
  if (!owned) throw new HttpError(404, "\u0411\u0438\u0437\u043D\u0435\u0441 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D.");
  if (method === "PUT" && (path.length === 2 || path[2] === "page" && path.length === 3)) {
    const raw = await input(req), config = await readSections2();
    let data;
    try {
      data = normalizeBusiness(path.length === 3 ? { ...raw, published: Boolean(owned.published) } : raw, config.categories);
    } catch (e) {
      throw new HttpError(400, e.message);
    }
    const now = Date.now();
    const update = db.prepare("UPDATE businesses SET title=?,category=?,description=?,city=?,website=?,published=?,updated_at=? WHERE id=? AND owner_id=?").bind(data.title, data.category, data.description, data.city, data.website, data.published, now, id, account.userId);
    if (path.length === 3) {
      const page = pageFields(raw);
      await db.batch([update, db.prepare("INSERT INTO business_pages(business_id,about,address,phone,email,hours) VALUES(?,?,?,?,?,?) ON CONFLICT(business_id) DO UPDATE SET about=excluded.about,address=excluded.address,phone=excluded.phone,email=excluded.email,hours=excluded.hours").bind(id, page.about, page.address, page.phone, page.email, page.hours)]);
    } else await update.run();
    return json({ id, ...data, pageUrl: "/business/" + id });
  }
  if (method === "DELETE" && path.length === 2) {
    const media = await db.prepare("SELECT object_key FROM business_media WHERE business_id=?").bind(id).all();
    if (media.results.length && !bucket) throw new HttpError(503, "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0435\u0449\u0451 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F.");
    await db.batch([
      db.prepare("DELETE FROM business_posts WHERE business_id=?").bind(id),
      db.prepare("DELETE FROM business_media WHERE business_id=?").bind(id),
      db.prepare("DELETE FROM business_pages WHERE business_id=?").bind(id),
      db.prepare("DELETE FROM businesses WHERE id=? AND owner_id=?").bind(id, account.userId)
    ]);
    await Promise.all(media.results.map((m) => bucket.delete(m.object_key)));
    return json({ ok: true });
  }
  if (path[2] === "media") {
    if (!bucket) throw new HttpError(503, "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0435\u0449\u0451 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F.");
    if (method === "POST" && path.length === 3) {
      const form = await req.formData(), file = form.get("file"), kind = String(form.get("kind") || "gallery");
      if (!["logo", "cover", "gallery"].includes(kind)) throw new HttpError(400, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438.");
      if (!(file instanceof File) || !file.size) throw new HttpError(400, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044E.");
      if (file.size > 8 * 1024 * 1024) throw new HttpError(413, "\u0424\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044F \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u043D\u0435 \u0431\u043E\u043B\u044C\u0448\u0435 8 \u041C\u0411.");
      const bytes = new Uint8Array(await file.arrayBuffer()), type = imageType(bytes);
      if (!type) throw new HttpError(400, "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438 JPG, PNG \u0438 WebP.");
      const current = await db.prepare("SELECT id,kind,object_key,size FROM business_media WHERE business_id=?").bind(id).all();
      if (kind === "gallery" && current.results.filter((m) => m.kind === "gallery").length >= 40) throw new HttpError(400, "\u0412 \u0433\u0430\u043B\u0435\u0440\u0435\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u0434\u043E 40 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439.");
      const replaced = kind === "gallery" ? [] : current.results.filter((m) => m.kind === kind);
      const total = await db.prepare("SELECT COALESCE(SUM(m.size),0) AS total FROM business_media m JOIN businesses b ON b.id=m.business_id WHERE b.owner_id=?").bind(account.userId).first();
      if (total.total - replaced.reduce((n, m) => n + m.size, 0) + file.size > 200 * 1024 * 1024) throw new HttpError(400, "\u0414\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442 \u043B\u0438\u043C\u0438\u0442 200 \u041C\u0411 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0432\u0430\u0448\u0438\u0445 \u0431\u0438\u0437\u043D\u0435\u0441\u043E\u0432. \u0423\u0434\u0430\u043B\u0438\u0442\u0435 \u043D\u0435\u043D\u0443\u0436\u043D\u044B\u0435 \u0444\u043E\u0442\u043E.");
      const mediaId = crypto.randomUUID(), key2 = mediaKey(id, mediaId), createdAt = Date.now();
      await bucket.put(key2, bytes, { httpMetadata: { contentType: type } });
      const insert = db.prepare("INSERT INTO business_media(id,business_id,kind,object_key,content_type,size,created_at) VALUES(?,?,?,?,?,?,?)").bind(mediaId, id, kind, key2, type, file.size, createdAt);
      try {
        await db.batch(kind === "gallery" ? [insert] : [db.prepare("DELETE FROM business_media WHERE business_id=? AND kind=?").bind(id, kind), insert]);
      } catch (error) {
        await bucket.delete(key2);
        throw error;
      }
      await Promise.all(replaced.map((m) => bucket.delete(m.object_key)));
      return json({ id: mediaId, kind, created_at: createdAt }, 201);
    }
    if (method === "DELETE" && path.length === 4) {
      const media = await db.prepare("SELECT object_key FROM business_media WHERE id=? AND business_id=?").bind(path[3], id).first();
      if (!media) throw new HttpError(404, "\u0424\u043E\u0442\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.");
      await bucket.delete(media.object_key);
      await db.prepare("DELETE FROM business_media WHERE id=? AND business_id=?").bind(path[3], id).run();
      return json({ ok: true });
    }
  }
  if (path[2] === "posts") {
    if (method === "POST" && path.length === 3 || method === "PUT" && path.length === 4) {
      const raw = await input(req), body = String(raw.body ?? "").trim();
      if (!body || body.length > 5e3) throw new HttpError(400, "\u0412 \u0437\u0430\u043F\u0438\u0441\u0438 \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043E\u0442 1 \u0434\u043E 5000 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432.");
      const postId = path[3] || crypto.randomUUID(), now = Date.now();
      if (method === "POST") {
        const count = await db.prepare("SELECT COUNT(*) AS count FROM business_posts WHERE business_id=?").bind(id).first();
        if (count.count >= 200) throw new HttpError(400, "\u041D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u0434\u043E 200 \u0437\u0430\u043F\u0438\u0441\u0435\u0439. \u0423\u0434\u0430\u043B\u0438\u0442\u0435 \u0441\u0442\u0430\u0440\u044B\u0435, \u0447\u0442\u043E\u0431\u044B \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043D\u043E\u0432\u044B\u0435.");
        await db.prepare("INSERT INTO business_posts(id,business_id,body,created_at,updated_at) VALUES(?,?,?,?,?)").bind(postId, id, body, now, now).run();
      } else {
        const result = await db.prepare("UPDATE business_posts SET body=?,updated_at=? WHERE id=? AND business_id=?").bind(body, now, postId, id).run();
        if (!result.meta.changes) throw new HttpError(404, "\u0417\u0430\u043F\u0438\u0441\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.");
      }
      return json({ id: postId, body }, method === "POST" ? 201 : 200);
    }
    if (method === "DELETE" && path.length === 4) {
      const result = await db.prepare("DELETE FROM business_posts WHERE id=? AND business_id=?").bind(path[3], id).run();
      if (!result.meta.changes) throw new HttpError(404, "\u0417\u0430\u043F\u0438\u0441\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.");
      return json({ ok: true });
    }
  }
  throw new HttpError(404, "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441.");
}

// public/assets/profile-model.mjs
var MAX_PHOTOS = 6;
function createPage(seed = {}) {
  const text = (key2, max) => typeof seed[key2] === "string" ? seed[key2].slice(0, max) : "";
  return { version: 1, revision: 0, profile: { name: text("name", 60), business: text("business", 100), about: text("about", 1e3), status: "", city: "", website: "" }, avatar: null, cover: null, photos: [], posts: [] };
}
function value(v, max) {
  return String(v ?? "").trim().slice(0, max);
}
function safeWebsite(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s);
    return ["http:", "https:"].includes(u.protocol) && u.hostname.includes(".") && !u.username && !u.password ? u.href : "";
  } catch {
    return "";
  }
}
function transition(current, action) {
  const page = structuredClone(current);
  const post = () => {
    const found = page.posts.find((p) => p.id === action.id);
    if (!found) throw new Error("\u0417\u0430\u043F\u0438\u0441\u044C \u0443\u0436\u0435 \u0443\u0434\u0430\u043B\u0435\u043D\u0430.");
    return found;
  };
  switch (action.type) {
    case "profile": {
      const data = action.data;
      if (!value(data.name, 60)) throw new Error("\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0432\u0430\u0448\u0435 \u0438\u043C\u044F.");
      if (data.website.trim() && !safeWebsite(data.website)) throw new Error("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u0441\u0430\u0439\u0442\u0430, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 https://example.com.");
      page.profile = { ...page.profile, name: value(data.name, 60), business: value(data.business, 100), about: value(data.about, 1e3), status: value(data.status, 140), city: value(data.city, 80), website: safeWebsite(data.website) };
      break;
    }
    case "photos": {
      for (const item of action.photos) if (!page.photos.some((p) => p.id === item.id)) page.photos.push({ id: item.id, name: value(item.name, 150), createdAt: item.createdAt });
      if (action.slot) {
        if (!["avatar", "cover"].includes(action.slot) || !action.photos[0]) throw new Error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044E.");
        page[action.slot] = action.photos[0].id;
      }
      break;
    }
    case "post": {
      const text = value(action.text, 5e3), photoIds = action.photoIds || [];
      if (!text && !photoIds.length) throw new Error("\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0442\u0435\u043A\u0441\u0442 \u0438\u043B\u0438 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044E.");
      if (photoIds.length > MAX_PHOTOS) throw new Error("\u041A \u0437\u0430\u043F\u0438\u0441\u0438 \u043C\u043E\u0436\u043D\u043E \u043F\u0440\u0438\u043A\u0440\u0435\u043F\u0438\u0442\u044C \u043D\u0435 \u0431\u043E\u043B\u044C\u0448\u0435 6 \u0444\u043E\u0442\u043E.");
      if (photoIds.some((id) => !page.photos.some((p) => p.id === id))) throw new Error("\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044F \u0434\u043B\u044F \u0437\u0430\u043F\u0438\u0441\u0438.");
      if (page.posts.some((p) => p.id === action.id)) throw new Error("\u0417\u0430\u043F\u0438\u0441\u044C \u0443\u0436\u0435 \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u0430.");
      page.posts.unshift({ id: action.id, text, photoIds, createdAt: action.now, updatedAt: null, liked: false, pinned: false, comments: [] });
      break;
    }
    case "editPost": {
      const item = post(), text = value(action.text, 5e3);
      if (!text && !item.photoIds.length) throw new Error("\u0417\u0430\u043F\u0438\u0441\u044C \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043F\u0443\u0441\u0442\u043E\u0439.");
      item.text = text;
      item.updatedAt = action.now;
      break;
    }
    case "deletePost":
      page.posts = page.posts.filter((p) => p.id !== action.id);
      break;
    case "like": {
      const item = post();
      item.liked = !item.liked;
      break;
    }
    case "pin": {
      const item = post(), next = !item.pinned;
      page.posts.forEach((p) => p.pinned = false);
      item.pinned = next;
      break;
    }
    case "comment": {
      const text = value(action.text, 1e3);
      if (!text) throw new Error("\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439.");
      post().comments.push({ id: action.commentId, text, createdAt: action.now });
      break;
    }
    case "deleteComment": {
      const item = post();
      item.comments = item.comments.filter((c) => c.id !== action.commentId);
      break;
    }
    case "deletePhoto": {
      page.photos = page.photos.filter((p) => p.id !== action.id);
      if (page.avatar === action.id) page.avatar = null;
      if (page.cover === action.id) page.cover = null;
      page.posts.forEach((p) => p.photoIds = p.photoIds.filter((id) => id !== action.id));
      page.posts = page.posts.filter((p) => p.text || p.photoIds.length);
      break;
    }
    default:
      throw new Error("\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435.");
  }
  page.revision++;
  return page;
}

// lib/profile-api.ts
var key = (owner, id) => "profile-media/" + encodeURIComponent(owner) + "/" + id;
var identifier = (value2) => typeof value2 === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value2);
function cleanAction(raw, photos) {
  if (!raw || typeof raw !== "object" || !["profile", "photos", "post", "editPost", "deletePost", "like", "pin", "comment", "deleteComment", "deletePhoto"].includes(raw.type)) throw new HttpError(400, "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F.");
  const action = { ...raw, now: Date.now() };
  if (raw.id !== void 0 && !identifier(raw.id)) throw new HttpError(400, "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440.");
  if (raw.commentId !== void 0 && !identifier(raw.commentId)) throw new HttpError(400, "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439.");
  if (["post", "comment"].includes(raw.type) && !identifier(raw.type === "post" ? raw.id : raw.commentId)) throw new HttpError(400, "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440 \u0437\u0430\u043F\u0438\u0441\u0438.");
  if (raw.type === "post" && (!Array.isArray(raw.photoIds) || raw.photoIds.some((id) => !identifier(id)))) throw new HttpError(400, "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438 \u0437\u0430\u043F\u0438\u0441\u0438.");
  if (raw.type === "profile") action.data = Object.fromEntries(["name", "business", "about", "status", "city", "website"].map((k) => [k, String(raw.data?.[k] ?? "")]));
  if (raw.type === "photos") {
    action.photos = photos;
    if (!photos.length) throw new HttpError(400, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438.");
  }
  return action;
}
function restore(raw, photos) {
  let page = createPage();
  page = transition(page, cleanAction({ type: "profile", data: raw?.profile }, []));
  if (photos.length) page = transition(page, { type: "photos", photos });
  for (const slot of ["avatar", "cover"]) if (photos.some((p) => p.id === raw?.[slot])) page[slot] = raw[slot];
  if (!Array.isArray(raw?.posts) || raw.posts.length > 200) throw new HttpError(400, "\u041C\u043E\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u0434\u043E 200 \u0437\u0430\u043F\u0438\u0441\u0435\u0439.");
  for (const item of [...raw.posts].reverse()) {
    const action = cleanAction({ type: "post", id: item.id, text: item.text, photoIds: item.photoIds }, []);
    page = transition(page, action);
    const post = page.posts[0];
    if (Number.isFinite(item.createdAt) && item.createdAt > 9466848e5 && item.createdAt <= Date.now()) post.createdAt = item.createdAt;
    post.liked = item.liked === true;
    for (const comment of (Array.isArray(item.comments) ? item.comments : []).slice(0, 100)) page = transition(page, cleanAction({ type: "comment", id: item.id, commentId: comment.id, text: comment.text }, []));
  }
  const pinned = raw.posts.find((p) => p.pinned === true);
  if (pinned) page = transition(page, { type: "pin", id: pinned.id });
  return page;
}
async function handleProfile(req, user, { db, bucket }, path) {
  const account = requireUser(user), saved = await db.prepare("SELECT value,revision FROM profiles WHERE owner_id=?").bind(account.userId).first();
  const current = saved ? JSON.parse(saved.value) : createPage({ name: account.displayName }), revision = saved?.revision || 0;
  if (req.method === "GET" && path.length === 1) return json({ page: current, photos: current.photos.map((p) => ({ ...p, url: "/api/profile/photos/" + encodeURIComponent(p.id) })) });
  if (req.method === "GET" && path[1] === "photos" && path.length === 3) {
    const photo = current.photos.find((p) => p.id === path[2]);
    if (!photo) throw new HttpError(404, "\u0424\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.");
    if (!bucket) throw new HttpError(503, "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0435\u0449\u0451 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F.");
    const object = await bucket.get(key(account.userId, photo.storageId || photo.id));
    if (!object) throw new HttpError(404, "\u0424\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.");
    return new Response(object.body, { headers: { "Content-Type": photo.contentType, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" } });
  }
  if (req.method !== "POST" || path.length !== 2 || !["actions", "import"].includes(path[1])) throw new HttpError(404, "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441.");
  let raw, form = null;
  try {
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      form = await req.formData();
      raw = JSON.parse(String(form.get("payload")));
    } else raw = await req.json();
  } catch {
    throw new HttpError(400, "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0444\u0438\u043B\u044F.");
  }
  if (!raw || raw.revision !== revision) throw new HttpError(409, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0436\u0435 \u0438\u0437\u043C\u0435\u043D\u0451\u043D \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435. \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435.");
  if (path[1] === "import" && revision !== 0) throw new HttpError(409, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0436\u0435 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D. \u041F\u0435\u0440\u0435\u043D\u043E\u0441 \u043D\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u043C\u0435\u043D\u044F\u0442\u044C \u0432\u0430\u0448\u0438 \u0434\u0430\u043D\u043D\u044B\u0435.");
  const uploads = raw.photos ?? [];
  if (!Array.isArray(uploads) || uploads.length > 100) throw new HttpError(400, "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439.");
  if (uploads.length && !bucket) throw new HttpError(503, "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0435\u0449\u0451 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F.");
  const photos = [], bodies = [], seen = /* @__PURE__ */ new Set();
  for (const p of uploads) {
    if (!p || !identifier(p.id) || seen.has(p.id) || current.photos.some((old) => old.id === p.id)) throw new HttpError(400, "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0430\u044F \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044F.");
    seen.add(p.id);
    const file = form?.get("photo_" + p.id);
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) throw new HttpError(400, "\u041A\u0430\u0436\u0434\u0430\u044F \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044F \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u043D\u0435 \u0431\u043E\u043B\u044C\u0448\u0435 8 \u041C\u0411.");
    const bytes = new Uint8Array(await file.arrayBuffer()), type = imageType(bytes);
    if (!type) throw new HttpError(400, "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E JPG, PNG \u0438 WebP.");
    photos.push({ id: p.id, name: String(p.name || "\u0424\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044F").slice(0, 150), createdAt: Date.now(), size: file.size, contentType: type, storageId: crypto.randomUUID() });
    bodies.push(bytes);
  }
  let next;
  try {
    if (path[1] === "import") next = restore(raw.page, photos);
    else {
      const action = cleanAction(raw.action, photos);
      next = current;
      if (photos.length && action.type !== "photos") next = transition(next, { type: "photos", photos });
      next = transition(next, action);
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, error.message);
  }
  const metadata = new Map([...current.photos, ...photos].map((p) => [p.id, p]));
  next.photos = next.photos.map((p) => {
    const original = metadata.get(p.id);
    return { ...p, size: original.size, contentType: original.contentType, storageId: original.storageId };
  });
  if (next.photos.length > 100 || next.posts.length > 200 || next.posts.some((p) => p.comments.length > 100)) throw new HttpError(400, "\u0414\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442 \u043B\u0438\u043C\u0438\u0442: 100 \u0444\u043E\u0442\u043E, 200 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u0438\u043B\u0438 100 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0435\u0432 \u043A \u0437\u0430\u043F\u0438\u0441\u0438.");
  if (next.photos.reduce((n, p) => n + (p.size || 0), 0) > 200 * 1024 * 1024) throw new HttpError(400, "\u0414\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442 \u043B\u0438\u043C\u0438\u0442 200 \u041C\u0411 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044F.");
  next.revision = revision + 1;
  const serialized = JSON.stringify(next);
  if (serialized.length > 2 * 1024 * 1024) throw new HttpError(400, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D. \u0423\u0434\u0430\u043B\u0438\u0442\u0435 \u0447\u0430\u0441\u0442\u044C \u0441\u0442\u0430\u0440\u044B\u0445 \u0437\u0430\u043F\u0438\u0441\u0435\u0439.");
  const uploaded = [];
  try {
    for (let i = 0; i < photos.length; i++) {
      const objectKey = key(account.userId, photos[i].storageId);
      await bucket.put(objectKey, bodies[i], { httpMetadata: { contentType: photos[i].contentType } });
      uploaded.push(objectKey);
    }
    const result = await db.prepare("INSERT INTO profiles(owner_id,value,revision,updated_at) VALUES(?,?,?,?) ON CONFLICT(owner_id) DO UPDATE SET value=excluded.value,revision=excluded.revision,updated_at=excluded.updated_at WHERE profiles.revision=?").bind(account.userId, serialized, next.revision, Date.now(), revision).run();
    if (!result.meta.changes) throw new HttpError(409, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0436\u0435 \u0438\u0437\u043C\u0435\u043D\u0451\u043D \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435. \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443.");
  } catch (error) {
    await Promise.all(uploaded.map((k) => bucket.delete(k)));
    throw error;
  }
  for (const photo of current.photos) if (!next.photos.some((p) => p.id === photo.id) && bucket) await bucket.delete(key(account.userId, photo.storageId || photo.id));
  return json({ page: next });
}

// lib/api.ts
function scopeKey(owner, id) {
  return "private-files/" + encodeURIComponent(owner) + "/" + id;
}
async function readSections(db) {
  const saved = await db.prepare("SELECT value,revision,updated_at FROM catalog_settings WHERE key=?").bind("sections").first();
  if (!saved) return { categories: defaultCategories, revision: 0, updatedAt: null };
  return { categories: JSON.parse(saved.value), revision: saved.revision, updatedAt: saved.updated_at };
}
async function handleApi(req, user, { db, bucket, adminEmail, adminUserId }) {
  try {
    const url = new URL(req.url), path = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean), method = req.method;
    if (!["GET", "HEAD"].includes(method)) {
      const origin = req.headers.get("origin");
      if (origin && origin !== url.origin) throw new HttpError(403, "\u0417\u0430\u043F\u0440\u043E\u0441 \u0441 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0441\u0430\u0439\u0442\u0430 \u043E\u0442\u043A\u043B\u043E\u043D\u0451\u043D.");
      if (req.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "\u0417\u0430\u043F\u0440\u043E\u0441 \u0441 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0441\u0430\u0439\u0442\u0430 \u043E\u0442\u043A\u043B\u043E\u043D\u0451\u043D.");
      const length = Number(req.headers.get("content-length") || 0);
      if (length > 21 * 1024 * 1024) throw new HttpError(413, "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440 \u0444\u0430\u0439\u043B\u0430 \u2014 20 \u041C\u0411.");
    }
    const isAdmin = Boolean(user && (adminUserId ? user.userId === adminUserId : adminEmail && user.email.trim().toLowerCase() === adminEmail.trim().toLowerCase()));
    if (path[0] === "me" && method === "GET") return json({ user: user ? { id: user.userId, name: user.displayName, isAdmin } : null });
    if (!db) throw new HttpError(503, "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0435\u0449\u0451 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443.");
    if (path[0] === "profile") return await handleProfile(req, user, { db, bucket }, path);
    if (path[0] === "categories" && path.length === 1 && method === "GET") return json(await readSections(db));
    if (path[0] === "admin" && path[1] === "categories" && path.length === 2) {
      requireUser(user);
      if (!isAdmin) throw new HttpError(403, "\u0420\u0430\u0437\u0434\u0435\u043B\u0430\u043C\u0438 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430 \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440.");
      if (method === "GET") return json(await readSections(db));
      if (method === "PUT") {
        const raw = await input(req), current = await readSections(db);
        if (!Number.isInteger(raw.revision) || raw.revision !== current.revision) throw new HttpError(409, "\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u0443\u0436\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u044B \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043D\u0443\u044E \u0432\u0435\u0440\u0441\u0438\u044E \u043F\u0435\u0440\u0435\u0434 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435\u043C.");
        let categories;
        try {
          categories = normalizeSections(raw.categories);
        } catch (error) {
          throw new HttpError(400, error.message);
        }
        if (current.categories.some((c) => !categories.some((n) => n.id === c.id))) throw new HttpError(400, "\u0421\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B \u0434\u043E\u043B\u0436\u043D\u044B \u043E\u0441\u0442\u0430\u0442\u044C\u0441\u044F \u0432 \u0441\u043F\u0438\u0441\u043A\u0435. \u0418\u0445 \u043C\u043E\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C.");
        const now = Date.now(), revision = current.revision + 1, serialized = JSON.stringify(categories);
        const result = current.revision === 0 ? await db.prepare("INSERT INTO catalog_settings(key,value,revision,updated_at) VALUES(?,?,?,?) ON CONFLICT(key) DO NOTHING").bind("sections", serialized, revision, now).run() : await db.prepare("UPDATE catalog_settings SET value=?,revision=?,updated_at=? WHERE key=? AND revision=?").bind(serialized, revision, now, "sections", current.revision).run();
        if (!result.meta.changes) throw new HttpError(409, "\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u0443\u0436\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u044B \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043D\u0443\u044E \u0432\u0435\u0440\u0441\u0438\u044E.");
        return json({ categories, revision, updatedAt: now });
      }
    }
    if (path[0] === "businesses") return await handleBusinesses(req, user, { db, bucket }, path, () => readSections(db));
    if (path[0] === "notes") {
      const account = requireUser(user);
      if (method === "GET" && path.length === 1) {
        const result = await db.prepare("SELECT id,title,body,created_at,updated_at FROM notes WHERE owner_id=? ORDER BY updated_at DESC").bind(account.userId).all();
        return json({ notes: result.results });
      }
      if (method === "POST" && path.length === 1 || method === "PUT" && path.length === 2) {
        const raw = await input(req), title = String(raw.title ?? "").trim().slice(0, 100), body = String(raw.body ?? "").trim().slice(0, 1e4);
        if (!title || !body) throw new HttpError(400, "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438 \u0442\u0435\u043A\u0441\u0442 \u0437\u0430\u043C\u0435\u0442\u043A\u0438.");
        const now = Date.now(), id = path[1] || crypto.randomUUID();
        if (method === "POST") await db.prepare("INSERT INTO notes(id,owner_id,title,body,created_at,updated_at) VALUES(?,?,?,?,?,?)").bind(id, account.userId, title, body, now, now).run();
        else {
          const result = await db.prepare("UPDATE notes SET title=?,body=?,updated_at=? WHERE id=? AND owner_id=?").bind(title, body, now, id, account.userId).run();
          if (!result.meta.changes) throw new HttpError(404, "\u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.");
        }
        return json({ id, title, body }, method === "POST" ? 201 : 200);
      }
      if (method === "DELETE" && path.length === 2) {
        const result = await db.prepare("DELETE FROM notes WHERE id=? AND owner_id=?").bind(path[1], account.userId).run();
        if (!result.meta.changes) throw new HttpError(404, "\u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.");
        return json({ ok: true });
      }
    }
    if (path[0] === "files") {
      const account = requireUser(user);
      if (!bucket) throw new HttpError(503, "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0444\u0430\u0439\u043B\u043E\u0432 \u0435\u0449\u0451 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F.");
      if (method === "GET" && path.length === 1) {
        const result = await db.prepare("SELECT id,name,size,content_type,created_at FROM files WHERE owner_id=? ORDER BY created_at DESC").bind(account.userId).all();
        return json({ files: result.results });
      }
      if (method === "POST" && path.length === 1) {
        const form = await req.formData(), file = form.get("file");
        if (!(file instanceof File)) throw new HttpError(400, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B.");
        if (file.size > 20 * 1024 * 1024) throw new HttpError(413, "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440 \u0444\u0430\u0439\u043B\u0430 \u2014 20 \u041C\u0411.");
        const current = await db.prepare("SELECT COALESCE(SUM(size),0) AS total FROM files WHERE owner_id=?").bind(account.userId).first();
        if (current.total + file.size > 200 * 1024 * 1024) throw new HttpError(400, "\u0412 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0435 \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442 \u043B\u0438\u043C\u0438\u0442 200 \u041C\u0411. \u0423\u0434\u0430\u043B\u0438\u0442\u0435 \u043D\u0435\u043D\u0443\u0436\u043D\u044B\u0435 \u0444\u0430\u0439\u043B\u044B.");
        const id = crypto.randomUUID(), key2 = scopeKey(account.userId, id), name = file.name.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 220) || "\u0424\u0430\u0439\u043B", type = file.type || "application/octet-stream";
        await bucket.put(key2, await file.arrayBuffer(), { httpMetadata: { contentType: "application/octet-stream" } });
        try {
          await db.prepare("INSERT INTO files(id,owner_id,name,content_type,size,object_key,created_at) VALUES(?,?,?,?,?,?,?)").bind(id, account.userId, name, type, file.size, key2, Date.now()).run();
        } catch (error) {
          await bucket.delete(key2);
          throw error;
        }
        return json({ id, name, size: file.size }, 201);
      }
      if (path.length === 2 && (method === "GET" || method === "DELETE")) {
        const file = await db.prepare("SELECT * FROM files WHERE id=? AND owner_id=?").bind(path[1], account.userId).first();
        if (!file) throw new HttpError(404, "\u0424\u0430\u0439\u043B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D.");
        if (method === "DELETE") {
          await bucket.delete(file.object_key);
          await db.prepare("DELETE FROM files WHERE id=? AND owner_id=?").bind(path[1], account.userId).run();
          return json({ ok: true });
        }
        const object = await bucket.get(file.object_key);
        if (!object) throw new HttpError(404, "\u0424\u0430\u0439\u043B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D.");
        return new Response(object.body, { headers: { "Content-Type": "application/octet-stream", "Content-Length": String(file.size), "Content-Disposition": `attachment; filename="download"; filename*=UTF-8''` + encodeURIComponent(file.name).replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16)), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" } });
      }
    }
    throw new HttpError(404, "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441.");
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error("Account API failure", error instanceof Error ? error.message : "unknown");
    return json({ error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437." }, 500);
  }
}
export {
  handleApi
};
