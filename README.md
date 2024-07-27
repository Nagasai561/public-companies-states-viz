# Public Companies States Viz

Visualize how public companies listed on BSE are distributed among Indian States and UTs.
The data is last updated on 27 July 2024.


This project uses **D3.js**, a popular JavaScript library for Data Visualization.
The whole process of data collection, cleaning, patching, validation is automated via python scripts.
Raw data collection is done through API's provided by BSE and python's requests library


# Sources

1. Group A and B companies list: https://www.bseindia.com/corporates/List_Scrips.html
2. GeoJson file for India: https://gadm.org/download_country.html
3. BSE API for Company and it's registered office location: https://api.bseindia.com/BseIndiaAPI/api/CorpInfoNew/w?scripcode={code}
4. BSE API for Company and it's Market cap: https://api.bseindia.com/BseIndiaAPI/api/StockTrading/w?flag=&quotetype=EQ&scripcode={code}


# Note

+ I had to decide on a criteria to decide what state a company belongs to. I finally choose, company's registered office address.
+ I only considered group A and group B companies from BSE. This is done so that we capture majority of market without including potentially unreliable data.
+ In the process of data collection, some companies details weren't found in BSE database. So, I have decided to exclude them.
These are the exlcuded company's symbols
    - AIRTELPP 
    - IBULPP
    - AURUMPP
    - SKIPPERPP
    - NGILPP
    - NOVAAGRI
    - MVGJL
    - PLAZACABLE
    - SIRCA
    - URAVI
    - YATHARTH

# Workflow

+ Download GeoJson for India at **Source (2)**
+ Download group A and B company data from **Source (1)**, store them in */fetched_data*
+ Aggregate them to a single file.

    */fetched_data/group_A_companies.csv*
                                             aggregated_companies.py
                +                           --------------------------->   *./processed_data/aggregated_companies.csv*

    */fetched_data/group_B_companies.csv*

+ Get Company-State data.

                    get_companies_states.py
    **Source (3)** -------------------------> *./processed_data/companies_states.csv*

+ Validate whether State names present in GeoJson and *./processed_data/companies_states.csv* are same. If not change them.

+ Combine state and market cap information.

    */processed_data/aggregated_companies.csv*
                                                    make_final_file.py
                    +                           ------------------------------> *./processed_data/final_file.csv*    

    */processed_data/companies_states.csv*
