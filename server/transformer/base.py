import pandas as pd
import csv
import os


class TransformerError(Exception):
    pass


class Transformer(object):

    def __init__(self, source, target):

        self.source = source
        self.target = target

    def read(self):

        try:
            self.df = pd.read_csv(self.source)

        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):

        self.df.to_csv(self.target, index=False)

    def remove(self):
        os.remove(self.target)

    def __repr__(self):
        return "<BaseTransformer with \nSource: {}\nTarget: {}>".format(self.source, self.target)
