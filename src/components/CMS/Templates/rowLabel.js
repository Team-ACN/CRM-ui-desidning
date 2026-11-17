import { COMPONENT_TYPES, SYSTEM_WIDGETS, getComponent, componentTitle } from '../../../data/mockCms';

export function rowLabel(row) {
  if (row.kind === 'system') return SYSTEM_WIDGETS[row.widget].label;
  const component = getComponent(row.componentId);
  return row.kind === 'top' ? `Top banner${component ? ` · ${componentTitle(component)}` : ''}` : componentTitle(component) || 'Component';
}

// "Banner", "Carousel · 3 posts" — what kind of component it is (and how many posts).
export function typeLine(component) {
  const meta = COMPONENT_TYPES[component?.type];
  if (!meta) return '';
  return meta.carousel ? `${meta.label} · ${component.items.length} posts` : meta.label;
}

// The component's own name; carousels have none, so use their first post's name.
export function componentName(component) {
  if (!component) return '';
  if (COMPONENT_TYPES[component.type]?.carousel) return component.items[0]?.name || component.items[0]?.description || component.internalName || 'Carousel';
  return component.internalName;
}
