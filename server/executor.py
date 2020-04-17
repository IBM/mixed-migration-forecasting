import json
import os
import time


def transformer_class(source):
    """ Imports the transformer class for a data source """

    class_name = source['transformer']
    sub_mods = class_name.split(sep=".")
    module = __import__(".".join(sub_mods[:-1]), fromlist=sub_mods[-1])
    class_module = getattr(module, sub_mods[-1])
    return class_module


def execute(source, config):

    # Path manipulation
    if isinstance(source['sourcefile'], list):
        src = [os.path.join(config['paths']['datasets'], s)
               for s in source['sourcefile']]

    elif isinstance(source['sourcefile'], str):
        src = os.path.join(config['paths']['datasets'],
                           source['sourcefile'])

    else:
        raise TypeError("Source files for {} not a string or list.".format(source['name']))

    tgt_fld = os.path.join(config['paths']['output'], source['name'])
    if not os.path.exists(tgt_fld):
        os.mkdir(tgt_fld)

    tgt = os.path.join(tgt_fld, "data.csv")

    # Fetch the transformer class for this source
    tr = transformer_class(source)
    transformer = tr(src, tgt)

    # Transform and output
    starttime = time.time()
    transformer.read()
    transformer.transform()
    transformer.write()
    print("Transformer for source:{:s} took {:3.2f} sec.".format(source['name'],
                                                                 time.time() - starttime))


if __name__ == "__main__":

    with open("configuration.json", 'rt') as infile:
        config = json.load(infile)

    print("Transforming {} sources:".format(len(config['sources'])))
    for source in config['sources']:
        execute(source, config)
