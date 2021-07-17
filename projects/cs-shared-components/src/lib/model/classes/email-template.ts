export class EmailTemplate {
  public FSKey:                           string;
  public name                             = '';
  public description                      = '';
  public subject                          = '';
  public body                             = '';
  public createdTimeStamp:                number;

  static fromJsonList(array: any): EmailTemplate[] {

    return array.map(EmailTemplate.fromJson);

  }

  static fromJson(emailTemplate: {
    FSKey,
    name,
    description,
    subject,
    body,
    createdTimeStamp,
  }): EmailTemplate {

    return emailTemplate;

  }

  constructor() {

    this.createdTimeStamp = Date.now();

  }
}
