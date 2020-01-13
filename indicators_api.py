"""
App endpoints for indicators/features used
"""

CONFIGURATION = 'configuration.json'

def set_up(app, config):
    
    with open(CONFIGURATION, 'rt') as infile:
        config = json.load(infile)
    
    @app.route("/countries")
    def countries():
        countries = []
        afg = {}
        afg["Country Name"]="Afghanistan"
        afg["Country Code"]="AFG"
        countries.append(afg)
        mmr={}
        mmr["Country Name"]="Myanmar"
        mmr["Country Code"]="MMR"
        countries.append(mmr)
        return jsonify(countries), 200

    @app.route("/indicators")
    def indicators():
        country = request.args.get('country')
        indicator = request.args.get('indicator')
        years = request.args.get('years')

        countries = country.split(',')

        df = pred_api2.features.df_raw

        # with open("configuration.json", 'rt') as infile:
        #     config = json.load(infile)
        # sources = [os.path.join(config['paths']['output'],
        #                         d['name'],
        #                         'data.csv') for d in config['sources']]

        # for ds in sources:
        # df = pd.read_csv(ds)
        if indicator == 'all':
            if country != 'all':
                df = df.loc[df["Country Code"].isin(countries)]
        else:
            if country != 'all':
                df = df.loc[(df["Country Code"].isin(countries)) & (df["Indicator Code"] == indicator)]
            else:
                df = df.loc[df["Indicator Code"] == indicator]
            # print(indicators)

        if years:
            if len(years) == 4:
                df = df.loc[df["year"] == int(years)]
            else:
                df = df.loc[df["year"] >= int(years[:4])]
                df = df.loc[df["year"] <= int(years[5:])]

        return df.to_json(orient='records')



    @app.route("/predictam", methods=['get'])
    def forecast2():

        # if 'username' not in session:
        #    return redirect(url_for('login'))

        # get required query parameters
        forecastyear = request.args.get('year')
        country = request.args.get('country')

        if forecastyear is None:
            return make_response(jsonify({"msg": "Invalid call. Forecast year missing."}), 405)



        # Get the (optional) scenario inputs
        scenario = {}

        result = pred_api2.predict(forecastyear=forecastyear, country=country)

            # Get the current values/categories for each indicator
        curr_scenario = {}


        curr_value = {}
        for subtheme, info in curr_scenario.items():
            tot = 0
            for ind in info:
                tot += LABELS.index(info[ind][1])
            curr_value[subtheme] = LABELS[round(tot / len(info))]

        for m in result:
            m['scenario'] = curr_value

        logger.info(result)

        return jsonify(result), 200

    @app.route("/indicatorCodeByName")
    def indicatorCodeByName():
        indicatorName = request.args.get('indicator')
        responce = pred_api2.features.df_raw.loc[(pred_api2.features.df_raw["Indicator Name"] == indicatorName)]["Indicator Code"].unique()[0]
        return jsonify(responce), 200

    @app.route("/uniqueIndicators")
    def uniqueIndicators():

        indicators = pred_api2.features.df_raw["Indicator Code"].unique()
        responce = [*indicators]
        return jsonify(responce), 200

    @app.route("/uniqueIndicatorNames")
    def uniqueIndicatorNames():

        indicators = pred_api2.features.df_raw["Indicator Name"].unique()
        responce = [*indicators]
        return jsonify(responce), 200