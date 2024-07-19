import requests
import csv
import json
import time

additional_wait_time = 2
aggregated_companies_file_path = "./processed_data/aggregated_companies.csv"
companies_states_file_path = "./processed_data/companies_states_new.csv"
url_template_state = "https://api.bseindia.com/BseIndiaAPI/api/CorpInfoNew/w?scripcode={code}"
url_template_market_cap = "https://api.bseindia.com/BseIndiaAPI/api/StockTrading/w?flag=&quotetype=EQ&scripcode={code}"
main_url = "https://www.bseindia.com/"
header = {
    "Referer": "https://www.bseindia.com/",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    "Content-Type": "application/json; charset=utf-8",
    "Accept-Encoding": "identity",
    "Origin": "https://www.bseindia.com"
}
session = requests.Session()
response = session.get(main_url)

data_missing_companies = []
ind = 1

with open(companies_states_file_path, 'w') as outfile:
    with open(aggregated_companies_file_path, 'r') as infile:
        reader = csv.DictReader(infile)
        writer = csv.DictWriter(outfile, ["Security Id", "State", "Market Cap"])
        writer.writeheader()

        for row in reader:
            sec_code = row["Security Code"]
            sec_id = row["Security Id"]
   
            # getting state variable
            response.status_code = 201
            while response.status_code != 200:
                response = session.get(url_template_state.format(code = sec_code), headers=header, stream=True)
                if response.status_code == 503:
                    t = response.headers.get("Retry-After")
                    print(f"Id: {sec_id} Sleeping for {float(t) + additional_wait_time} seconds")
                    time.sleep(float(t)+additional_wait_time)


            dict = json.loads(response.raw.read())
            state = None
            if "Table1" not in dict.keys():
                print(f"{sec_id} doesn't have Table1") 
                data_missing_companies.append(sec_id)
            elif not dict["Table1"]:
                print(f"{sec_id} doesn't have rows in Table1")
                data_missing_companies.append(sec_id)
            elif "State" not in dict["Table1"][0].keys():
                print(f"{sec_id} doesn't have State row in Table1")
                data_missing_companies.append(sec_id)
            else:
                state = dict["Table1"][0]["State"]

            # getting marketcap
            response.status_code = 201
            while response.status_code != 200:
                response = session.get(url_template_market_cap.format(code = sec_code), headers=header, stream=True)
                if response.status_code == 503:
                    t = response.headers.get("Retry-After")
                    print(f"Id: {sec_id} Sleeping for {float(t) + additional_wait_time} seconds")
                    time.sleep(float(t) + additional_wait_time)

            dict = json.loads(response.raw.read())
            marketcap = None
            if("MktCapFull" in list(dict.keys())):
                marketcap = dict["MktCapFull"].replace(',', '')
            else:
                print(f"{sec_id} doesn't have market cap value")

            writer.writerow({
                "Security Id": sec_id, 
                "State": state,
                "Market Cap": marketcap
            })
            
            if(ind%50 == 0):
                print(f"processed {ind} companies")
            ind += 1


print("------COMPLETE------")
print(f"Couldn't find data for the companies: {data_missing_companies}")