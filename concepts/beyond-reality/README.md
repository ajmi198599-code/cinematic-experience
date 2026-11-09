# BEYOND REALITY — Interactive Concept Lab

A standalone, mobile-friendly **interactive concept report** demonstrating two possible web experiences. This is an explanatory prototype, not a complete production website.

**Try the page:** Open `index.html` in any browser. It works offline without a build step, package installation, API calls, or external assets.

## What can you explore?

1. **Cinematic landing page:** Enter a glowing portal, switch between atmospheric worlds (Fire, Nature, Space), and follow a short narrative journey.
2. **Virtual shopping mall:** Go through the entrance, pick an electronics/grocery/fashion shop, browse sample products, and add items to a demonstration basket.
3. **Design and performance:** Compare lightweight, balanced, and full-3D implementation approaches; read the step-by-step delivery plan.
4. **Languages:** Switch between English and Arabic using the header control.

## A practical build path

- **Phase 1:** Build one polished portal scene and transition; test on mobile devices.
- **Phase 2:** Add either three selectable worlds or a functional mall corridor and single shop.
- **Phase 3:** Publish via Vercel, measure loading performance, then expand with optimized media.

## Performance approach

Use CSS motion, layered images, and selective lightweight 3D rather than trying to download a full detailed city or shopping centre. Defer assets for later scenes and test with real devices. Any MB numbers are provisional planning ranges, **not measured page sizes or guarantees**.

## Limitations

No checkout, live inventory, purchases, user accounts, real products, sound, or heavy 3D are included. Prices and shopping interactions are fictional examples.

## Deploy to Vercel

Set **Root Directory** to `concepts/beyond-reality` and **Framework Preset** to `Other` (static HTML). Vercel can serve the `index.html` at the site's root. For a safe deployment, point a new Vercel project at this feature branch rather than replacing an existing production project.

---

# بالعربية — شرح سريع

هذا **تقرير تفاعلي** يوضح فكرتين: صفحة هبوط سينمائية فيها بوابة وعوالم متعددة، ومركز تسوق افتراضي مصغر تدخل منه إلى متاجر وتجرب سلة منتجات. يمكنك التبديل بين العربية والإنجليزية، والانتقال بين المشاهد، ومقارنة مستويات تعقيد التصميم.

النموذج توضيحي فقط: لا توجد مدفوعات أو متاجر أو منتجات حقيقية. للبدء افتح ملف `index.html` مباشرة من المتصفح، ولا تحتاج إلى تثبيت أي شيء. عند النشر على Vercel اختر مجلد `concepts/beyond-reality` كمجلد أساسي للمشروع.
