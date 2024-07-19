import csv
import re


group_B_companies_file_path = "./fetched_data/group_B_companies.csv"
group_A_companies_file_path = "./fetched_data/group_A_companies.csv"
fund_pat = re.compile("fund", re.IGNORECASE)
etf_pat = re.compile("etf", re.IGNORECASE)

with open("./processed_data/aggregated_companies.csv", 'w') as out:
    with open(group_A_companies_file_path, 'r') as filea:
        with open(group_B_companies_file_path, 'r') as fileb:

            reader = csv.DictReader(filea)
            writer = csv.DictWriter(out, reader.fieldnames)
            writer.writeheader()
            for row in reader:
                if(row["Status"] == "Active" and 
                row["Instrument"] == "Equity" and
                not re.search(fund_pat, row["Security Name"]) and
                not re.search(etf_pat, row["Security Name"])):
                    
                    writer.writerow(row)
        
            reader = csv.DictReader(fileb)
            for row in reader:
                if(row["Status"] == "Active" and 
                row["Instrument"] == "Equity" and
                not re.search(fund_pat, row["Security Name"]) and
                not re.search(etf_pat, row["Security Name"])):
                    
                    writer.writerow(row)
    

