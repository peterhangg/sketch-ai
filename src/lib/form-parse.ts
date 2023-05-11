import type { NextApiRequest } from "next";
import formidable from "formidable";

type ParsedRequest = {
  fields: formidable.Fields;
  files: formidable.Files;
};

export const FormidableError = formidable.errors.FormidableError;

export async function parseForm(req: NextApiRequest): Promise<ParsedRequest> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}
