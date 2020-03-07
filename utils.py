import argparse


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Execute utilities')
    parser.add_argument('-utility', '--u', type=str,
                        required=True, help='Utility to run (gridsearch/evaluation)')

    args = parser.parse_args()
    
    if args.u == 'gridsearch':

        # grid search
        from utils import gridsearch
        gridsearch.execute()

    elif args.u == 'evaluation':

        # model evaluation
        from utils import evaluation
        evaluation.run()

    else:
        raise NotImplementedError("'{}' is not a implemented utility.".format(args.u))