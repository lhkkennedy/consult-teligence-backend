import type { Schema, Struct } from '@strapi/strapi';

export interface ConsultantsCaseStudies extends Struct.ComponentSchema {
  collectionName: 'components_consultants_case_studies';
  info: {
    displayName: 'caseStudies';
  };
  attributes: {
    description: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ConsultantsContactInfo extends Struct.ComponentSchema {
  collectionName: 'components_consultants_contact_infos';
  info: {
    displayName: 'contactInfo';
  };
  attributes: {
    Email: Schema.Attribute.String;
    LinkedIn: Schema.Attribute.String;
    Phone: Schema.Attribute.String;
  };
}

export interface ConsultantsTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_consultants_testimonials';
  info: {
    displayName: 'testimonials';
  };
  attributes: {
    company: Schema.Attribute.String;
    name: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'consultants.case-studies': ConsultantsCaseStudies;
      'consultants.contact-info': ConsultantsContactInfo;
      'consultants.testimonials': ConsultantsTestimonials;
    }
  }
}
