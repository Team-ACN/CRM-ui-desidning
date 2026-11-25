import { Trash2, BarChart3, Mail, MessageSquare, Building2, KeyRound, Sparkles, Newspaper, ConciergeBell, Layers, Search, Image, Film, Clock, MapPin } from 'lucide-react';

export const WIDGET_ICONS = {
  DELIST_INVENTORIES: Trash2,
  PROPERTY_EDGE_CARDS: BarChart3,
  ENQUIRY_RECEIVED: Mail,
  ENQUIRY_FEEDBACK: MessageSquare,
  RESALE_INVENTORY: Building2,
  RENTAL_INVENTORY: KeyRound,
  SUGGESTED_PROPERTIES: Sparkles,
  EDGE_WIDGET: Newspaper,
  SERVICE_WIDGET: ConciergeBell,
  POPULAR_SERVICES: ConciergeBell,
  POPUP: Layers,
  SEARCH: Search,
  EDGE_HERO: Image,
  EDGE_VISUAL_STORIES: Film,
  EDGE_PROJECT_UPDATES: Newspaper,
  EDGE_LAST_48: Clock,
  EDGE_LOCATION_SORT: MapPin,
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`PROPERTY_SECTION_${i + 1}`, Building2])),
};
