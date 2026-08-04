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

function MapaCard({ local, isLoaded }) {
  const [aberto, setAberto] = useState(false)

  const onLoad = useCallback((map) => {
    map.setCenter({ lat: local.lat, lng: local.lng })
  }, [local])

  return (
    <div className="mapa-card">
      <span className="mapa-tipo">{local.tipo}</span>
      <h3 className="mapa-nome">{local.nome}</h3>

      <div className="mapa-iframe-wrap">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: local.lat, lng: local.lng }}
            zoom={15}
            onLoad={onLoad}
            options={{
              styles: mapStyles,
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            <MarkerF
              position={{ lat: local.lat, lng: local.lng }}
              onClick={() => setAberto(true)}
            />

            {aberto && (
              <InfoWindowF
                position={{ lat: local.lat, lng: local.lng }}
                onCloseClick={() => setAberto(false)}
              >
                <div className="mapa-infowindow">
                  <strong>{local.tipo}</strong>
                  <p>{local.nome}</p>
                  <span>{local.endereco}</span>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div className="mapa-fallback">
            <p className="mapa-fallback-text">Carregando mapa…</p>
          </div>
        )}
      </div>

      <a
        className="map-btn"
        href={`https://www.google.com/maps/search/?api=1&query=${local.lat},${local.lng}`}
        target="_blank"
        rel="noreferrer"
      >
        Abrir {local.tipo} no Google Maps
      </a>
    </div>
  )
}

export default function MapaEvento({ locais }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-casamento',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  })

  // Sem chave configurada ainda: mostra um fallback elegante em vez de quebrar
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="mapa-evento-section">
        <div className="section-header fade-in">
          <span className="section-tag">Como chegar</span>
          <h2 className="section-title">No <em>Mapa</em></h2>
          <div className="ornament-line"></div>
        </div>
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
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mapa-evento-section">
        <div className="mapa-fallback">
          <p className="mapa-fallback-text">Não foi possível carregar o mapa agora.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mapa-evento-section">
      <div className="section-header fade-in">
        <span className="section-tag">Como chegar</span>
        <h2 className="section-title">No <em>Mapa</em></h2>
        <div className="ornament-line"></div>
      </div>
      <div className="mapa-grid fade-in">
        {locais.map((local) => (
          <MapaCard key={local.nome} local={local} isLoaded={isLoaded} />
        ))}
      </div>
    </div>
  )
}