import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home Page")
        .id("homePageSingleton")
        .icon(() => "🏠")
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("Home Page")
        ),

      S.listItem()
        .title("About Page")
        .id("aboutPageSingleton")
        .icon(() => "ℹ️")
        .child(
          S.document()
            .schemaType("aboutPage")
            // This documentId makes it a singleton
            .documentId("aboutPage")
            .title("About Page")
        ),

      S.listItem()
        .title("Product Page")
        .id("productPageSingleton")
        .icon(() => "🧪")
        .child(
          S.document()
            .schemaType("productPage")
            .documentId("productPage")
            .title("Product Page")
        ),

      S.listItem()
        .title("Site Settings")
        .id("siteSettingsSingleton")
        .icon(() => "⚙️")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site Settings")
        ),

      S.listItem()
        .title("Products")
        .id("products")
        .icon(() => "🛍️")
        .child(
          S.documentTypeList("product")
            .title("Products")
            .defaultOrdering([{ field: "sortOrder", direction: "asc" }])
        ),

      // Optional: show everything else (useful while debugging templates)
      // If you want a clean CMS later, remove this block.
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          !["homePage", "aboutPage", "productPage", "siteSettings", "product"].includes(
            item.getId() as string
          )
      ),
    ]);
