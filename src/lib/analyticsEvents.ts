// Typed builders for the data attributes src/lib/analytics.ts reads, so event names
// and their properties are checked at build time:
//   <a {...clickEvent("project_card_clicked", { project_id, project_title, card_placement: "grid" })}>
//   <body {...pageEvent("project_opened", { project_id, project_title })}>

type CardPlacement = "grid" | "featured" | "selected_work";

type ClickEvents = {
  navigation_link_clicked: { nav_destination: string; nav_label: string; nav_location: "header" | "home" | "not_found" };
  project_card_clicked: { project_id?: string; project_title?: string; card_placement: CardPlacement };
  blog_post_card_clicked: { post_id?: string; post_title?: string; card_placement: CardPlacement };
  contact_link_clicked: { contact_type: "email" | "github" | "linkedin"; contact_value: string };
  external_project_link_clicked: { project_title: string; link_type: "github" | "website"; link_url: string; link_text: string };
};

type PageEvents = {
  project_opened: { project_id: string; project_title: string };
  blog_post_opened: { post_id: string; post_title: string };
  page_not_found: undefined;
};

export function clickEvent<E extends keyof ClickEvents>(event: E, properties: ClickEvents[E]) {
  return { "data-analytics-event": event, "data-analytics-props": JSON.stringify(properties) };
}

export function pageEvent<E extends keyof PageEvents>(
  event: E,
  ...[properties]: PageEvents[E] extends undefined ? [] : [PageEvents[E]]
) {
  return {
    "data-analytics-page-event": event,
    ...(properties && { "data-analytics-props": JSON.stringify(properties) }),
  };
}
