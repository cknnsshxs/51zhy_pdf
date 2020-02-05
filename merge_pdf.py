#!/usr/bin/env python
from PyPDF2 import PdfFileReader, PdfFileWriter
import os
import sys


def pdf_cat(input_files, output):
    input_streams = []
    try:
        for input_file in input_files:
            input_streams.append(open(input_file, 'rb'))
        writer = PdfFileWriter()
        for reader in map(PdfFileReader, input_streams):
            for n in range(reader.getNumPages()):
                writer.addPage(reader.getPage(n))
        output_stream = open(output, 'w+b')
        writer.write(output_stream)
    finally:
        for f in input_streams:
            f.close()


def file_name_walk(file_dir):
    for root, dirs, files in os.walk(file_dir):
        files.sort(key=lambda x: int(x[x.rfind('-') + 1:][:-4]))
        file_list = [file_dir + '\\' + file for file in files]
        pdf_cat(file_list, files[0][:files[0].rfind('-')] + '.pdf')


if __name__ == '__main__':
    if len(sys.argv) > 1:
        file_name_walk(sys.argv[1])
