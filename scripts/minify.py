from jsmin import jsmin
import json

def minify_json(from_file_path, to_file_path):
    with open(from_file_path, 'r') as from_file:
        with open(to_file_path, 'w') as to_file:
            dict = json.load(from_file)
            json.dump(dict, to_file, separators=(',', ':'))


def minify_js(from_file_path, to_file_path):
    with open(from_file_path, 'r') as from_file:
        with open(to_file_path, 'w') as to_file:
            minified = jsmin(from_file.read())
            to_file.write(minified)


geojson_file_path = "./processed_data/final_map.json"
minified_geojson_file_path = "./minified/minified_map.json"

js_file_path = "./index.js"
minified_js_file_path = "./minified/minified_index.js"

minify_json(geojson_file_path, minified_geojson_file_path)
minify_js(js_file_path, minified_js_file_path)