import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';

import { FleetMapMarker } from '../../../core/models/fleet.models';

export type { FleetMapMarker };

/**
 * Capa base: teselas de OpenStreetMap (sin API key, aptas para prototipos).
 * El componente las desatura con CSS para mantener la paleta corporativa.
 */
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Mapa interactivo de la flota (Leaflet + capa base CARTO Positron).
 *
 * - `markers()` es un Signal: al cambiar (recarga de telemetría, cambio de
 *   unidad seleccionada) el mapa se redibuja de forma reactiva.
 * - Si la capa base no puede descargarse, el componente degrada a una
 *   rejilla local manteniendo los pines y los popups operativos.
 */
@Component({
  selector: 'dl-fleet-map',
  templateUrl: './fleet-map.html',
  styleUrl: './fleet-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetMapComponent implements AfterViewInit, OnDestroy {
  /** Marcadores a dibujar. */
  readonly markers = input.required<readonly FleetMapMarker[]>();

  /** Alto del contenedor, p. ej. "26rem" o "22rem". */
  readonly height = input<string>('26rem');

  /** Zoom inicial (se ignora si hay más de un marcador: se ajusta el encuadre). */
  readonly zoom = input<number>(11);

  /** Centrado: cuando es `true` se respeta `zoom()` sobre el primer marcador. */
  readonly singleUnit = input<boolean>(false);

  /** Id del marcador resaltado. */
  readonly selectedId = input<string | null>(null);

  /** Etiqueta flotante de la esquina superior izquierda. */
  readonly overlayLabel = input<string>('');

  private readonly canvasRef = viewChild.required<ElementRef<HTMLDivElement>>('canvas');

  private map?: L.Map;
  private markerLayer?: L.LayerGroup;
  private zoneLayer?: L.LayerGroup;
  private tileLayer?: L.TileLayer;
  private readonly markerIndex = new Map<string, L.Marker>();
  private renderedIds = '';

  /** `true` una vez que la vista está lista para hospedar el mapa. */
  private readonly viewReady = signal(false);

  /** `true` si la capa base de tiles no pudo cargarse. */
  readonly tilesUnavailable = signal(false);

  constructor() {
    effect(() => {
      const ready = this.viewReady();
      const markers = this.markers();
      const selected = this.selectedId();

      if (!ready || markers.length === 0) return;
      this.renderMarkers(markers, selected);
    });
  }

  ngAfterViewInit(): void {
    const host = this.canvasRef().nativeElement;

    this.map = L.map(host, {
      center: [19.415, -99.175],
      zoom: this.zoom(),
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
      preferCanvas: false,
    });

    this.tileLayer = L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: 'abc',
      maxZoom: 19,
      minZoom: 4,
      crossOrigin: true,
    });

    this.tileLayer.on('tileerror', () => this.tilesUnavailable.set(true));
    this.tileLayer.addTo(this.map);

    this.zoneLayer = L.layerGroup().addTo(this.map);
    this.markerLayer = L.layerGroup().addTo(this.map);

    this.viewReady.set(true);

    // Leaflet mide el contenedor al inicializar; un reajuste evita
    // tiles grises cuando el mapa aparece dentro de una tarjeta animada.
    setTimeout(() => this.map?.invalidateSize(), 180);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
  }

  /** Redibuja pines y geocercas a partir del estado actual. */
  private renderMarkers(
    markers: readonly FleetMapMarker[],
    selectedId: string | null,
  ): void {
    if (!this.map || !this.markerLayer || !this.zoneLayer) return;

    this.markerLayer.clearLayers();
    this.zoneLayer.clearLayers();
    this.markerIndex.clear();

    for (const item of markers) {
      if (item.accuracyRadiusM) {
        L.circle([item.lat, item.lng], {
          radius: item.accuracyRadiusM,
          color: '#111111',
          weight: 1,
          opacity: 0.35,
          fillColor: '#111111',
          fillOpacity: 0.06,
        }).addTo(this.zoneLayer);
      }

      const isSelected = item.id === selectedId;
      const marker = L.marker([item.lat, item.lng], {
        icon: buildIcon(item, isSelected),
        title: item.title,
        riseOnHover: true,
      })
        .bindPopup(buildPopup(item), { closeButton: true, maxWidth: 280 })
        .addTo(this.markerLayer);

      this.markerIndex.set(item.id, marker);
    }

    const ids = markers.map((m) => m.id).join('|');
    if (ids !== this.renderedIds) {
      this.renderedIds = ids;
      this.fitToMarkers(markers);
    }

    const selected = selectedId ? this.markerIndex.get(selectedId) : undefined;
    if (selected) selected.openPopup();
  }

  /** Ajusta el encuadre a todos los marcadores (o centra en la unidad única). */
  private fitToMarkers(markers: readonly FleetMapMarker[]): void {
    if (!this.map || markers.length === 0) return;

    if (this.singleUnit() || markers.length === 1) {
      this.map.setView([markers[0].lat, markers[0].lng], this.zoom(), { animate: false });
      return;
    }

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as L.LatLngTuple));
    this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13, animate: false });
  }
}

/** Construye el `divIcon` corporativo del pin. */
function buildIcon(item: FleetMapMarker, selected: boolean): L.DivIcon {
  const classes = ['dl-marker', `dl-marker--${item.tone}`];
  if (selected) classes.push('dl-marker--selected');

  return L.divIcon({
    className: 'dl-marker-wrapper',
    html: `<div class="${classes.join(' ')}"><i class="bi ${item.icon}" aria-hidden="true"></i></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    popupAnchor: [0, -30],
  });
}

/** Genera el HTML del popup del marcador. */
function buildPopup(item: FleetMapMarker): string {
  const rows = item.rows
    .map(
      (row) =>
        `<div class="dl-popup__row"><span>${escapeHtml(row.label)}</span><span>${escapeHtml(
          row.value,
        )}</span></div>`,
    )
    .join('');

  return `
    <div class="dl-popup">
      <p class="dl-popup__title">${escapeHtml(item.title)}</p>
      <p class="dl-popup__sub">${escapeHtml(item.subtitle)}</p>
      ${rows}
    </div>
  `;
}

/** Escapa texto antes de interpolarlo en HTML de Leaflet. */
function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
