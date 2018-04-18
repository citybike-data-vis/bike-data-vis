import csv
import argparse
import json

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("file", help="Input file")
    parser.add_argument("-o", "--output", help="Output filename")
    args = parser.parse_args()
    file = args.file

    csvfile = open(file, 'r')
    if(args.output):
        outfile = args.output
    else:
        outfile = args.file + ".json"
    
    reader = csv.DictReader( csvfile )
    out = json.dumps( [ row for row in reader ], sort_keys=True, indent=4)

    jsonfile = open(outfile, 'w')
    jsonfile.write(out)

if __name__ == "__main__":
    main()