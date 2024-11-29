import pandas as pd 
unemployment_data = pd.read_csv("data/Economy/unemployment_data_filtered.csv")
gdp_data = pd.read_csv("data/Economy/usa_gdp_per_capita.csv")
merged_data = unemployment_data.merge(gdp_data, left_on="year", right_on="year")
tile_map_data = merged_data[['FIPS Code', 'Area_Population','gdp_per_capita']]
tile_map_data.to_json("tile_map_data.json", orient='records')
tile_map_data.to_csv("tile_map_data.csv")
