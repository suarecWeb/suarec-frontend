export const PUBLICATION_TYPES = {
  SERVICE_OFFER: 'SERVICE_OFFER',
  SERVICE_REQUEST: 'SERVICE_REQUEST',
  COMPANY_SERVICE_OFFER: 'COMPANY_SERVICE_OFFER',
  COMPANY_JOB_OFFER: 'COMPANY_JOB_OFFER',
  INFORMAL_JOB_OFFER: 'INFORMAL_JOB_OFFER'
} as const;

export const PUBLICATION_TYPE_LABELS = {
  [PUBLICATION_TYPES.SERVICE_OFFER]: 'Ofrezco mi servicio',
  [PUBLICATION_TYPES.SERVICE_REQUEST]: 'Necesito un servicio',
  [PUBLICATION_TYPES.COMPANY_SERVICE_OFFER]: 'Empresa ofreciendo servicio',
  [PUBLICATION_TYPES.COMPANY_JOB_OFFER]: 'Empresa buscando empleado',
  [PUBLICATION_TYPES.INFORMAL_JOB_OFFER]: 'Oferta de trabajo informal'
};

export const PUBLICATION_TYPE_DESCRIPTIONS = {
  [PUBLICATION_TYPES.SERVICE_OFFER]: 'Publica los servicios que ofreces como profesional independiente',
  [PUBLICATION_TYPES.SERVICE_REQUEST]: 'Busca profesionales que te ayuden con tus necesidades',
  [PUBLICATION_TYPES.COMPANY_SERVICE_OFFER]: 'Tu empresa ofrece servicios especializados',
  [PUBLICATION_TYPES.COMPANY_JOB_OFFER]: 'Tu empresa busca nuevos talentos para unirse al equipo',
  [PUBLICATION_TYPES.INFORMAL_JOB_OFFER]: 'Oferta de trabajo por prestación de servicios por tiempo corto'
};

// Tipos disponibles por rol de usuario
export const PUBLICATION_TYPES_BY_ROLE = {
  PERSON: [
    PUBLICATION_TYPES.SERVICE_OFFER,
    PUBLICATION_TYPES.SERVICE_REQUEST,
    PUBLICATION_TYPES.INFORMAL_JOB_OFFER
  ],
  BUSINESS: [
    PUBLICATION_TYPES.SERVICE_REQUEST,
    PUBLICATION_TYPES.COMPANY_SERVICE_OFFER,
    PUBLICATION_TYPES.COMPANY_JOB_OFFER,
    PUBLICATION_TYPES.INFORMAL_JOB_OFFER
  ],
  ADMIN: Object.values(PUBLICATION_TYPES)
}; 