/* ============================================================
   MN Electronics Admin — shared EN/AR language toggle
   Include this file on every page:  <script src="i18n.js"></script>
   Mark translatable text with:      <span data-i18n="nav.dashboard">Dashboard</span>
   Add new phrases by adding a new key to both "en" and "ar" below,
   then use that key in a data-i18n attribute anywhere in the page.
   ============================================================ */

const I18N = {
  en: {
    "nav.overview":      "Overview",
    "nav.dashboard":     "Main Menu",
    "nav.catalog":       "Catalog",
    "nav.products":      "Products",
    "nav.categories":    "Categories",
    "nav.sales":         "Sales",
    "nav.orders":        "Orders",
    "nav.receipts":      "Receipts",
    "nav.customers":     "Customers",
    "nav.finance":       "Finance",
    "nav.debitcredit":   "Debit & Credit",
    "nav.reports":       "Reports",
    "nav.services":      "Services",
    "nav.team":          "Team",
    "nav.staff":         "Staff",
    "nav.system":        "System",
    "nav.settings":      "Settings",
    "sidebar.sub":       "ADMIN CONSOLE",
    "sidebar.role":      "Store Admin",
    "search.placeholder":"Search…",

    "dash.date":         "MONDAY, AUGUST 24 2026",
    "dash.col.order":    "Order",
    "dash.col.item":     "Item",
    "stat.orders":       "Orders this month",
    "stat.listings":     "Active listings",
    "stat.revenue":      "Revenue this month",
    "panel.recentOrders":"Recent orders",
    "panel.viewAll":     "View all →",
    "panel.lowStock":    "Low stock",
    "panel.manage":      "Manage →",
    "status.delivered":  "Delivered",
    "status.processing": "Processing",
    "status.pending":    "Pending",

    "common.cancel":     "Cancel",
    "common.save":       "Save",

    "prod.count":        "112 ITEMS · S.NB 0001–0112",
    "prod.search":       "Search by serial number (S.nb) — e.g. S-0041",
    "prod.filter.all":   "All brands",
    "prod.cat.refrigeration": "Refrigeration",
    "prod.cat.laundry":  "Laundry",
    "prod.cat.cooking":  "Cooking",
    "prod.cat.climate":  "Climate",
    "prod.add":          "Add product",
    "prod.lowStockWarning": "Low stock warning",
    "prod.col.snb":      "S.nb",
    "prod.col.barcode":  "Barcode",
    "prod.col.brand":    "Brand",
    "prod.col.type":     "Type",
    "prod.col.origin":   "Origin",
    "prod.col.dimensions":"Dimensions",
    "prod.col.warehouse":"Warehouse",
    "prod.col.min":      "Min",
    "prod.col.stock":    "Stock",
    "prod.wh.a":         "Warehouse A",
    "prod.wh.b":         "Warehouse B",
    "prod.wh.c":         "Warehouse C",
    "prod.origin.kr":    "South Korea",
    "prod.origin.de":    "Germany",
    "prod.origin.it":    "Italy",
    "prod.origin.jp":    "Japan",

    "cat.count":         "6 BRANDS · B.ID 001–006",
    "cat.search":        "Search brands…",
    "cat.add":           "Add Brand",
    "cat.col.brand":     "Brand",
    "cat.col.bid":       "B.ID",
    "cat.col.location":  "Location",
    "cat.col.phone":     "Phone nb",
    "cat.col.salesmen":  "Salesmen",

   // "cust.count":        "1,930 CUSTOMERS · C.ID 0001–1930",
    "cust.search":       "Search by customer name — e.g. R. Haddad",
    "cust.add":          "New Customer",
    "cust.col.cid":      "C.ID",
    "cust.col.address":  "Address",
    "cust.col.orders":   "Orders",
    "cust.col.totalSpent":"Total spent",
    "cust.col.debtStatus":"Debt status",
    "cust.debtClear":    "Clear",

    "staff.count":       "14 SALESMEN · S.ID 001–014",
    "staff.search":      "Search by salesman ID (S.ID) — e.g. SM-004",
    "staff.add":         "New Staff",

    "set.subtitle":      "STORE & ACCOUNT PREFERENCES",
    "set.store.title":   "Store information",
    "set.store.desc":    "Shown on invoices, receipts, and the storefront.",
    "set.store.name":    "Store name",
    "set.store.email":   "Contact email",
    "set.store.phone":   "Phone number",
    "set.store.currency":"Currency",
    "set.rate.title":    "Currency & exchange rate",
    "set.rate.desc":     "Set the USD → LBP rate used across invoices, receipts, and reports.",
    "set.rate.equals":   "1 USD equals (LBP)",
    "set.rate.updated":  "Last updated",
    "set.admin.title":   "Admin account",
    "set.admin.desc":    "Your personal login and profile details.",
    "set.admin.name":    "Name",
    "set.admin.role":    "Role",
    "set.admin.email":   "Email",
    "set.admin.password":"New password",
    "set.notif.title":   "Notifications",
    "set.notif.desc":    "Choose what triggers an alert in the console.",
    "set.notif.lowStock":"Low stock alerts",
    "set.notif.lowStockDesc":"Notify when an item's stock drops below 20 units",
    "set.notif.newOrder":"New order notifications",
    "set.notif.newOrderDesc":"Notify on every new invoice created",
    "set.notif.weekly":  "Weekly summary email",
    "set.notif.weeklyDesc":"Revenue, orders, and customer growth recap",
    "set.saveChanges":   "Save changes",

    "inv.title":         "Orders / Invoices",
    "inv.count":         "84 INVOICES · I.NB 0001–0084",
    "inv.search":        "Search by invoice nb (I.nb) — e.g. INV-0417",
    "inv.add":           "New Invoice",
    "inv.col.qty":       "Qty",
    "inv.col.subtotal":  "Sub-total",

    "rec.count":         "57 RECEIPTS · R.NB 0001–0057",
    "rec.search":        "Search by receipt nb (R.nb) — e.g. RCT-0233",
    "rec.add":           "New Receipt",
    "rec.totalPrice":    "Total price",
    "rec.col.amount":    "Amount",
    "rec.col.discount":  "Discount",

    "prod.modal.title":  "Add product",
    "prod.modal.submit": "Add product",
    "prod.field.name":   "Item name",
    "prod.field.madeIn": "Made in",
    "prod.field.minStock":"Min stock (alert threshold)",

    "cat.modal.title":   "Add brand",
    "cat.modal.submit":  "Add brand",
    "cat.field.name":    "Brand name",
    "cat.field.location":"Warehouse & city",
    "cat.field.phones":  "Phone nb (comma separated for multiple)",

    "cust.modal.title":  "New customer",
    "cust.modal.submit": "Add customer",
    "cust.field.name":   "Full name",
    "cust.field.addressDesc":"Address description (street, building, floor)",

    "staff.modal.title": "New staff member",
    "staff.modal.submit":"Add staff",
    "staff.field.brands":"Assigned brands (comma separated)",

    "sv.modal.title":    "Add service",
    "sv.modal.submit":   "Add service",
    "sv.field.name":     "Service name",
    "sv.field.price":    "Price ($)",
    "sv.field.duration": "Duration",
    "sv.field.status":   "Status",

    "inv.modal.title":   "New invoice",
    "inv.modal.submit":  "Create invoice",
    "inv.field.existingCustomer":"Existing customer",
    "inv.field.custSearchPh":"Search name, customer ID or phone...",
    "inv.field.firstName":"First name",
    "inv.field.lastName":"Family name",
    "inv.field.phone":   "Phone",
    "inv.field.addressPh":"Building, floor, landmark...",
    "inv.field.itemOrService":"Item or service",
    "inv.field.item":    "Item",
    "inv.field.addAnotherItem":"Add another item",
    "inv.field.serviceDesc":"Service description",
    "inv.field.serviceDescPh":"e.g. Repair + maintenance visit",
    "inv.field.itemSearchPh":"Search name or serial number...",
    "inv.field.payment": "Payment",
    "inv.field.paymentType":"Payment type",
    "inv.field.totalUsd":"Total ($)",

    "rec.modal.title":   "New receipt",
    "rec.modal.submit":  "Create receipt",
    "rec.field.itemSnb": "Item S.nb",
    "rec.field.totalBefore":"Total before discount ($)",
    "rec.field.discountPct":"Discount (%, blank if none)",
    "rec.field.tvaPct":  "TVA (%, blank if none)",
    "rec.field.finalTotal":"Total after discount & TVA ($)",

    "dc.title":          "Debit & Credit",
    "dc.subtitle":       "Money owed to us vs. money we owe",
    "dc.debit.title":    "Debit — customers who owe us",
    "dc.debit.desc":     "Invoices not paid in full.",
    "dc.credit.title":   "Credit — what we owe brands",
    "dc.credit.desc":    "Receipts not settled in full with suppliers.",
    "dc.total.debit":    "Total customer debt",
    "dc.total.credit":   "Total owed to brands",
    "dc.col.invoice":    "Invoice",
    "dc.col.receipt":    "Receipt",
    "dc.col.customer":   "Customer",
    "dc.col.brand":      "Brand",
    "dc.col.total":      "Total",
    "dc.col.paid":       "Paid",
    "dc.col.balance":    "Balance",
    "dc.col.status":     "Status",
    "dc.status.partial": "Partial",
    "dc.status.unpaid":  "Unpaid",

    "sv.title":          "Services",
    "sv.subtitle":       "Maintenance, delivery, and other add-ons",
    "sv.add":            "Add service",
    "sv.maintenance":    "Maintenance",
    "sv.delivery":       "Delivery",
    "sv.other":          "Other",
    "sv.col.service":    "Service",
    "sv.col.type":       "Type",
    "sv.col.price":      "Price",
    "sv.col.duration":   "Duration",
    "sv.col.status":     "Status",
    "sv.active":         "Active",
    "sv.inactive":       "Inactive",

    "rp.title":          "Reports",
    "rp.subtitle":       "Print invoices and receipts as saved reports",
    "rp.tab.invoices":   "Invoices",
    "rp.tab.receipts":   "Receipts",
    "rp.selectall":      "Select all",
    "rp.generate":       "Generate & print",
    "rp.col.select":     "",
    "rp.col.id":         "ID",
    "rp.col.party":      "Customer / Brand",
    "rp.col.date":       "Date",
    "rp.col.total":      "Total",
    "rp.saved.title":    "Saved reports",
    "rp.saved.name":     "Report",
    "rp.saved.type":     "Type",
    "rp.saved.date":     "Created",
    "rp.saved.items":    "Items",
    "rp.saved.action":   "",
    "rp.reprint":        "Reprint",
    "rp.empty":          "Select at least one item to generate a report."
  },
  ar: {
    "nav.overview":      "نظرة عامة",
    "nav.dashboard":     "القائمة الرئيسية",
    "nav.catalog":       "الكتالوج",
    "nav.products":      "المنتجات",
    "nav.categories":    "الفئات",
    "nav.sales":         "المبيعات",
    "nav.orders":        "الطلبات",
    "nav.receipts":      "الإيصالات",
    "nav.customers":     "العملاء",
    "nav.finance":       "المالية",
    "nav.debitcredit":   "المدين والدائن",
    "nav.reports":       "التقارير",
    "nav.services":      "الخدمات",
    "nav.team":          "الفريق",
    "nav.staff":         "الموظفون",
    "nav.system":        "النظام",
    "nav.settings":      "الإعدادات",
    "sidebar.sub":       "لوحة تحكم الإدارة",
    "sidebar.role":      "مدير المتجر",
    "search.placeholder":"بحث…",

    "dash.date":         "الاثنين، 24 أغسطس 2026",
    "dash.col.order":    "الطلب",
    "dash.col.item":     "الصنف",
    "stat.orders":       "الطلبات هذا الشهر",
    "stat.listings":     "المنتجات النشطة",
    "stat.revenue":      "الإيرادات هذا الشهر",
    "panel.recentOrders":"أحدث الطلبات",
    "panel.viewAll":     "عرض الكل ←",
    "panel.lowStock":    "مخزون منخفض",
    "panel.manage":      "إدارة ←",
    "status.delivered":  "تم التسليم",
    "status.processing": "قيد المعالجة",
    "status.pending":    "قيد الانتظار",

    "common.cancel":     "إلغاء",
    "common.save":       "حفظ",

    "prod.count":        "112 منتجًا · S.NB 0001–0112",
    "prod.search":       "بحث برقم المنتج (S.nb) — مثال: S-0041",
    "prod.filter.all":   "كل العلامات",
    "prod.cat.refrigeration": "التبريد",
    "prod.cat.laundry":  "الغسيل",
    "prod.cat.cooking":  "الطبخ",
    "prod.cat.climate":  "التكييف",
    "prod.add":          "إضافة منتج",
    "prod.lowStockWarning": "تنبيه انخفاض المخزون",
    "prod.col.snb":      "رقم المنتج",
    "prod.col.barcode":  "الباركود",
    "prod.col.brand":    "العلامة التجارية",
    "prod.col.type":     "النوع",
    "prod.col.origin":   "المنشأ",
    "prod.col.dimensions":"الأبعاد",
    "prod.col.warehouse":"المستودع",
    "prod.col.min":      "الحد الأدنى",
    "prod.col.stock":    "المخزون",
    "prod.wh.a":         "المستودع أ",
    "prod.wh.b":         "المستودع ب",
    "prod.wh.c":         "المستودع ج",
    "prod.origin.kr":    "كوريا الجنوبية",
    "prod.origin.de":    "ألمانيا",
    "prod.origin.it":    "إيطاليا",
    "prod.origin.jp":    "اليابان",

    "cat.count":         "6 علامات تجارية · B.ID 001–006",
    "cat.search":        "بحث عن علامة تجارية…",
    "cat.add":           "إضافة علامة تجارية",
    "cat.col.brand":     "العلامة التجارية",
    "cat.col.bid":       "رقم العلامة",
    "cat.col.location":  "الموقع",
    "cat.col.phone":     "رقم الهاتف",
    "cat.col.salesmen":  "المندوبون",

    //"cust.count":        "1,930 عميلًا · C.ID 0001–1930",
    "cust.search":       "بحث باسم العميل — مثال: R. Haddad",
    "cust.add":          "عميل جديد",
    "cust.col.cid":      "رقم العميل",
    "cust.col.address":  "العنوان",
    "cust.col.orders":   "الطلبات",
    "cust.col.totalSpent":"إجمالي الإنفاق",
    "cust.col.debtStatus":"حالة الدين",
    "cust.debtClear":    "لا يوجد دين",

    "staff.count":       "14 مندوبًا · S.ID 001–014",
    "staff.search":      "بحث برقم المندوب (S.ID) — مثال: SM-004",
    "staff.add":         "موظف جديد",

    "set.subtitle":      "إعدادات المتجر والحساب",
    "set.store.title":   "معلومات المتجر",
    "set.store.desc":    "تظهر في الفواتير والإيصالات وواجهة المتجر.",
    "set.store.name":    "اسم المتجر",
    "set.store.email":   "البريد الإلكتروني للتواصل",
    "set.store.phone":   "رقم الهاتف",
    "set.store.currency":"العملة",
    "set.rate.title":    "العملة وسعر الصرف",
    "set.rate.desc":     "حدد سعر صرف الدولار مقابل الليرة اللبنانية المستخدم في الفواتير والإيصالات والتقارير.",
    "set.rate.equals":   "1 دولار يعادل (ل.ل)",
    "set.rate.updated":  "آخر تحديث",
    "set.admin.title":   "حساب المسؤول",
    "set.admin.desc":    "بيانات تسجيل الدخول والملف الشخصي الخاصة بك.",
    "set.admin.name":    "الاسم",
    "set.admin.role":    "الدور",
    "set.admin.email":   "البريد الإلكتروني",
    "set.admin.password":"كلمة مرور جديدة",
    "set.notif.title":   "الإشعارات",
    "set.notif.desc":    "اختر ما الذي يُنشئ تنبيهًا في لوحة التحكم.",
    "set.notif.lowStock":"تنبيهات انخفاض المخزون",
    "set.notif.lowStockDesc":"إشعار عند انخفاض مخزون صنف عن 20 وحدة",
    "set.notif.newOrder":"إشعارات الطلبات الجديدة",
    "set.notif.newOrderDesc":"إشعار عند إنشاء كل فاتورة جديدة",
    "set.notif.weekly":  "ملخص أسبوعي بالبريد الإلكتروني",
    "set.notif.weeklyDesc":"ملخص الإيرادات والطلبات ونمو العملاء",
    "set.saveChanges":   "حفظ التغييرات",

    "inv.title":         "الطلبات / الفواتير",
    "inv.count":         "84 فاتورة · I.NB 0001–0084",
    "inv.search":        "بحث برقم الفاتورة (I.nb) — مثال: INV-0417",
    "inv.add":           "فاتورة جديدة",
    "inv.col.qty":       "الكمية",
    "inv.col.subtotal":  "المجموع الفرعي",

    "rec.count":         "57 إيصالًا · R.NB 0001–0057",
    "rec.search":        "بحث برقم الإيصال (R.nb) — مثال: RCT-0233",
    "rec.add":           "إيصال جديد",
    "rec.totalPrice":    "السعر الإجمالي",
    "rec.col.amount":    "الكمية",
    "rec.col.discount":  "الخصم",

    "prod.modal.title":  "إضافة منتج",
    "prod.modal.submit": "إضافة منتج",
    "prod.field.name":   "اسم المنتج",
    "prod.field.madeIn": "بلد الصنع",
    "prod.field.minStock":"الحد الأدنى للمخزون (حد التنبيه)",

    "cat.modal.title":   "إضافة علامة تجارية",
    "cat.modal.submit":  "إضافة علامة تجارية",
    "cat.field.name":    "اسم العلامة التجارية",
    "cat.field.location":"المستودع والمدينة",
    "cat.field.phones":  "أرقام الهاتف (افصل بينها بفاصلة)",

    "cust.modal.title":  "عميل جديد",
    "cust.modal.submit": "إضافة عميل",
    "cust.field.name":   "الاسم الكامل",
    "cust.field.addressDesc":"وصف العنوان (الشارع، المبنى، الطابق)",

    "staff.modal.title": "موظف جديد",
    "staff.modal.submit":"إضافة موظف",
    "staff.field.brands":"العلامات التجارية المسندة (افصل بينها بفاصلة)",

    "sv.modal.title":    "إضافة خدمة",
    "sv.modal.submit":   "إضافة خدمة",
    "sv.field.name":     "اسم الخدمة",
    "sv.field.price":    "السعر ($)",
    "sv.field.duration": "المدة",
    "sv.field.status":   "الحالة",

    "inv.modal.title":   "فاتورة جديدة",
    "inv.modal.submit":  "إنشاء فاتورة",
    "inv.field.existingCustomer":"عميل حالي",
    "inv.field.custSearchPh":"بحث بالاسم أو رقم العميل أو الهاتف...",
    "inv.field.firstName":"الاسم الأول",
    "inv.field.lastName":"اسم العائلة",
    "inv.field.phone":   "الهاتف",
    "inv.field.addressPh":"المبنى، الطابق، معلم قريب...",
    "inv.field.itemOrService":"صنف أو خدمة",
    "inv.field.item":    "صنف",
    "inv.field.addAnotherItem":"إضافة صنف آخر",
    "inv.field.serviceDesc":"وصف الخدمة",
    "inv.field.serviceDescPh":"مثال: صيانة + زيارة إصلاح",
    "inv.field.itemSearchPh":"بحث بالاسم أو رقم المنتج...",
    "inv.field.payment": "الدفع",
    "inv.field.paymentType":"نوع الدفع",
    "inv.field.totalUsd":"الإجمالي ($)",

    "rec.modal.title":   "إيصال جديد",
    "rec.modal.submit":  "إنشاء إيصال",
    "rec.field.itemSnb": "رقم المنتج",
    "rec.field.totalBefore":"الإجمالي قبل الخصم ($)",
    "rec.field.discountPct":"الخصم (% اتركه فارغًا إن لم يوجد)",
    "rec.field.tvaPct":  "الضريبة (% اتركها فارغة إن لم توجد)",
    "rec.field.finalTotal":"الإجمالي بعد الخصم والضريبة ($)",

    "dc.title":          "المدين والدائن",
    "dc.subtitle":       "الأموال المستحقة لنا مقابل الأموال المستحقة علينا",
    "dc.debit.title":    "مدين — عملاء عليهم مبالغ لنا",
    "dc.debit.desc":     "فواتير لم تُسدد بالكامل.",
    "dc.credit.title":   "دائن — ما ندين به للعلامات التجارية",
    "dc.credit.desc":    "إيصالات لم تُسوَّ بالكامل مع الموردين.",
    "dc.total.debit":    "إجمالي ديون العملاء",
    "dc.total.credit":   "إجمالي المستحق للعلامات التجارية",
    "dc.col.invoice":    "الفاتورة",
    "dc.col.receipt":    "الإيصال",
    "dc.col.customer":   "العميل",
    "dc.col.brand":      "العلامة التجارية",
    "dc.col.total":      "الإجمالي",
    "dc.col.paid":       "المدفوع",
    "dc.col.balance":    "الرصيد",
    "dc.col.status":     "الحالة",
    "dc.status.partial": "جزئي",
    "dc.status.unpaid":  "غير مدفوع",

    "sv.title":          "الخدمات",
    "sv.subtitle":       "الصيانة والتوصيل وخدمات إضافية أخرى",
    "sv.add":            "إضافة خدمة",
    "sv.maintenance":    "الصيانة",
    "sv.delivery":       "التوصيل",
    "sv.other":          "أخرى",
    "sv.col.service":    "الخدمة",
    "sv.col.type":       "النوع",
    "sv.col.price":      "السعر",
    "sv.col.duration":   "المدة",
    "sv.col.status":     "الحالة",
    "sv.active":         "فعّالة",
    "sv.inactive":       "غير فعّالة",

    "rp.title":          "التقارير",
    "rp.subtitle":       "طباعة الفواتير والإيصالات كتقارير محفوظة",
    "rp.tab.invoices":   "الفواتير",
    "rp.tab.receipts":   "الإيصالات",
    "rp.selectall":      "تحديد الكل",
    "rp.generate":       "إنشاء وطباعة",
    "rp.col.select":     "",
    "rp.col.id":         "الرقم",
    "rp.col.party":      "العميل / العلامة التجارية",
    "rp.col.date":       "التاريخ",
    "rp.col.total":      "الإجمالي",
    "rp.saved.title":    "التقارير المحفوظة",
    "rp.saved.name":     "التقرير",
    "rp.saved.type":     "النوع",
    "rp.saved.date":     "تاريخ الإنشاء",
    "rp.saved.items":    "العناصر",
    "rp.saved.action":   "",
    "rp.reprint":        "إعادة الطباعة",
    "rp.empty":          "اختر عنصرًا واحدًا على الأقل لإنشاء تقرير."
  }
};

/* Safe wrappers — localStorage can throw in some browser/page
   contexts (e.g. opening an HTML file directly via file://), and
   T() is called by every popup, so a throw here would silently
   break every "Add" button. Fall back to 'en' if storage is
   unavailable rather than letting the error propagate. */
function getSavedLang(){
  try { return localStorage.getItem('mn_lang') || 'en'; }
  catch (e) { return 'en'; }
}
function setSavedLang(lang){
  try { localStorage.setItem('mn_lang', lang); }
  catch (e) { /* storage unavailable — language just won't persist */ }
}

function applyLanguage(lang){
  const dict = I18N[lang] || I18N.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });

  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  const toggle = document.getElementById('langToggle');
  if (toggle) toggle.setAttribute('data-current', lang);

  setSavedLang(lang);
}

/* T(key) — look up a translation for the CURRENT language.
   Used inside JS-built markup (modals, dropdowns) where data-i18n
   attributes can't be applied ahead of time. Falls back to the
   English string (or the key itself) if nothing is found. */
function T(key){
  const lang = getSavedLang();
  const dict = I18N[lang] || I18N.en;
  return dict[key] || (I18N.en[key]) || key;
}

function initLangToggle(){
  const saved = getSavedLang();
  applyLanguage(saved);

  const toggle = document.getElementById('langToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = getSavedLang();
    applyLanguage(current === 'en' ? 'ar' : 'en');
  });
}

document.addEventListener('DOMContentLoaded', initLangToggle);
