// The Observatory map's zoom goes by quarter levels: by whole ones, fitting all of Catalonia into the part of
// the screen left free would often show it at half the size it could have. It has to be the map's own step
// (not only while fitting): Leaflet rounds the zoom to it again whenever it moves the view.
export const ZOOM_STEP = 0.25
