# mixed-migration-forecasting

*** Work in progress ***

Models used to provide strategic forecasts of mixed migration based on development indicators. The base model focuses on movements from Ethiopia to six major destinations and uses development indicators and survey data that capture migration drivers, the system provides forecasts and factors contributing to a prediction. With more than 65 million refugees in the world today, the highest number in history, the system aims at better equipping the humanitarian sector with AI tools to address the growing challenge.

# Setting up

1. Clone the repository
```
$ git clone git@github.com:IBM/mixed-migration-forecasting.git
```

2. Download the data and set up
```
$ wget https://ibm.box.com/shared/static/5075w222jnkdtr24kmufdd6692ejxrmv.gz
$ tar -xvf 5075w222jnkdtr24kmufdd6692ejxrmv.gz
```

3. Set up python dependencies.
```
$ cd mixed-migration-forecasting
$ pip install -r requirements.txt
```

4. Run the notebook server
```
$ jupyter notebook
```

# Models

1. Gradient boosting trees
2. A probabilistic graphical model
