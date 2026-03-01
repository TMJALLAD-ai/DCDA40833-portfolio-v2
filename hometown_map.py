import pandas as pd
import requests
import folium
from urllib.parse import quote

MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoidGpqYWxsYWQiLCJhIjoiY21sdG11MmpyMDF3eTNscHZ0ZmJxeG96bSJ9.Iq_H-toVsglrNwbwTCKm7Q"
MAPBOX_USERNAME = "tjjallad"
MAPBOX_STYLE_ID = "cmm0rqpob005901s1653vfhwf"

INPUT_CSV = "hometown_locations.csv"
OUTPUT_HTML = "lab06_map.html"


def geocode_address(address: str, access_token: str):
    query = quote(address)
    geocode_url = (
        f"https://api.mapbox.com/search/geocode/v6/forward"
        f"?q={query}&access_token={access_token}&limit=1"
    )

    response = requests.get(geocode_url, timeout=20)
    response.raise_for_status()
    data = response.json()

    features = data.get("features", [])
    if not features:
        return None, None

    lon, lat = features[0]["geometry"]["coordinates"]
    return lat, lon


def build_map():
    df = pd.read_csv(INPUT_CSV)

    required_columns = ["Name", "Address", "Type", "Description", "Image_URL"]
    missing = [column for column in required_columns if column not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    latitudes = []
    longitudes = []

    print("Geocoding addresses...")
    for idx, address in enumerate(df["Address"], start=1):
        lat, lon = geocode_address(address, MAPBOX_ACCESS_TOKEN)
        latitudes.append(lat)
        longitudes.append(lon)

        status = "OK" if lat is not None and lon is not None else "NOT FOUND"
        print(f"  [{idx}/{len(df)}] {address} -> {status}")

    df["Latitude"] = latitudes
    df["Longitude"] = longitudes

    valid_df = df.dropna(subset=["Latitude", "Longitude"]).copy()
    if valid_df.empty:
        raise RuntimeError("No valid geocoded points found. Check addresses or token/style settings.")

    tiles = (
        f"https://api.mapbox.com/styles/v1/{MAPBOX_USERNAME}/{MAPBOX_STYLE_ID}/tiles/256/"
        f"{{z}}/{{x}}/{{y}}@2x?access_token={MAPBOX_ACCESS_TOKEN}"
    )

    center_lat = valid_df["Latitude"].mean()
    center_lon = valid_df["Longitude"].mean()

    interactive_map = folium.Map(location=[center_lat, center_lon], zoom_start=12, tiles=None)
    folium.TileLayer(tiles=tiles, attr="Mapbox", name="Custom Basemap", control=False).add_to(interactive_map)

    type_colors = {
        "Restaurant": "red",
        "Park": "green",
        "School": "blue",
        "Cultural": "purple",
        "Historical": "orange",
        "Recreation": "cadetblue",
    }

    for _, row in valid_df.iterrows():
        marker_color = type_colors.get(str(row["Type"]).strip(), "gray")

        popup_html = f"""
        <div style='width:260px'>
            <h4 style='margin:0 0 8px 0'>{row['Name']}</h4>
            <p style='margin:0 0 8px 0'><strong>Type:</strong> {row['Type']}</p>
            <p style='margin:0 0 8px 0'>{row['Description']}</p>
            <img src='{row['Image_URL']}' alt='{row['Name']}' style='width:100%;border-radius:6px;'>
        </div>
        """

        folium.Marker(
            location=[row["Latitude"], row["Longitude"]],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=row["Name"],
            icon=folium.Icon(color=marker_color, icon="info-sign"),
        ).add_to(interactive_map)

    interactive_map.save(OUTPUT_HTML)

    print(f"\nMap saved to: {OUTPUT_HTML}")
    print(f"Mapped points: {len(valid_df)} of {len(df)}")


if __name__ == "__main__":
    build_map()
