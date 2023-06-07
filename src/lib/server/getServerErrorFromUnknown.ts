import { ZodError, ZodIssue } from "zod";
import { PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";
import { FormidableError } from "../form-parse";

function parseZodIssues(issues: ZodIssue[]): string {
  const errorMessages: string[] = issues.map((issue) => {
    if (issue.path && issue.message) {
      return `[${issue.path.join(".")}]: ${issue.message}`;
    } else if (issue.message) {
      return issue.message;
    }
    return "";
  });
  return errorMessages.join("; ");
}

export function getServerErrorFromUnknown(error: unknown): {
  statusCode: number;
  message: string;
} {
  if (error instanceof FormidableError) {
    return { statusCode: 400, message: error.message };
  }
  if (error instanceof ZodError) {
    return { statusCode: 400, message: parseZodIssues(error.issues) };
  }
  if (error instanceof PrismaClientUnknownRequestError) {
    return { statusCode: 400, message: error.message };
  }
  if (error instanceof Error) {
    return { statusCode: 500, message: error.message };
  }
  return {
    statusCode: 500,
    message: `Unexpected error of type '${typeof error}'. Please contact admin.`,
  };
}
