export const requireFields = (data: Record<string, any>, fields: string[]) => {
  const missing = fields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missing.length > 0) {
    throw { statusCode: 400, message: `Missing required field(s): ${missing.join(', ')}` };
  }
};

export const requireValidDate = (value: any, field: string) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw { statusCode: 400, message: `${field} must be a valid date` };
  }
  return date;
};

export const requirePositiveNumber = (value: any, field: string) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw { statusCode: 400, message: `${field} must be greater than zero` };
  }
  return number;
};

export const requireArray = (value: any, field: string) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw { statusCode: 400, message: `${field} must contain at least one item` };
  }
};
