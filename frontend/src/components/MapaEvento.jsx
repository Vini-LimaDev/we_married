import { useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api'
import './MapaEvento.css'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

// Estilo discreto e elegante para o mapa, combinando com a paleta do site
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#f9f5ef' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b6f5e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f9f5ef' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e8ddd0' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dccbb8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

export default function MapaEvento({ locais }) {
  const [ativo, setAtivo] = useState(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-casamento',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  })

  const center = {
    lat: (locais[0].lat + locais[1].lat) / 2,
    lng: (locais[0].lng + locais[1].lng) / 2,
  }

  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds()
    locais.forEach((l) => bounds.extend({ lat: l.lat, lng: l.lng }))
    map.fitBounds(bounds, 80)
  }, [locais])

  // Sem chave configurada ainda: mostra um fallback elegante em vez de quebrar
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="mapa-fallback">
        <div className="mapa-fallback-icon">📍</div>
        <p className="mapa-fallback-text">
          O mapa interativo será exibido aqui assim que a chave da API do
          Google Maps for configurada.
        </p>
        <div className="mapa-fallback-links">
          {locais.map((local) => (
            <a
              key={local.nome}
              className="map-btn"
              href={`https://www.google.com/maps/search/?api=1&query=${local.lat},${local.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir {local.tipo} no Google Maps
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mapa-fallback">
        <p className="mapa-fallback-text">Não foi possível carregar o mapa agora.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return <div className="mapa-fallback"><p className="mapa-fallback-text">Carregando mapa…</p></div>
  }

  return (
    <div className="mapa-wrapper">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {locais.map((local) => (
          <MarkerF
            key={local.nome}
            position={{ lat: local.lat, lng: local.lng }}
            onClick={() => setAtivo(local)}
          />
        ))}

        {ativo && (
          <InfoWindowF
            position={{ lat: ativo.lat, lng: ativo.lng }}
            onCloseClick={() => setAtivo(null)}
          >
            <div className="mapa-infowindow">
              <strong>{ativo.tipo}</strong>
              <p>{ativo.nome}</p>
              <span>{ativo.endereco}</span>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  )
}
