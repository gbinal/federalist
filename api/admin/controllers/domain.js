const { Domain, Site } = require('../../models');
const { fetchModelById } = require('../../utils/queryDatabase');
const { wrapHandlers } = require('../../utils');
const DomainService = require('../../services/Domain');
const { serialize, serializeMany } = require('../../serializers/domain');

module.exports = wrapHandlers({
  async list(req, res) {
    const {
      query: { site: siteId },
    } = req;

    const domains = await Domain.findAll({ where: { siteId } });

    const json = {
      meta: {
        environments: ['site', 'demo'],
      },
      data: serializeMany(domains, true),
    };
    return res.json(json);
  },

  async findById(req, res) {
    const {
      params: { id },
    } = req;

    const domain = await fetchModelById(id, Domain);
    if (!domain) {
      return res.notFound();
    }

    await DomainService.checkProvisioning(domain);

    return res.json(serialize(domain, true));
  },

  async create(req, res) {
    const {
      body: {
        name,
        branch,
        environment,
        siteId,
      },
    } = req;

    const site = await fetchModelById(siteId, Site);
    if (!site) {
      return res.notFound();
    }

    const domain = await DomainService.createDomain(site, { branch, environment, name });

    await DomainService.checkDnsAndUpdateDomain(domain);

    return res.json(serialize(domain, true));
  },

  async destroy(req, res) {
    const {
      params: { id },
    } = req;

    const domain = await fetchModelById(id, Domain);
    if (!domain) {
      return res.notFound();
    }

    await DomainService.destroyDomain(domain);

    return res.json({});
  },

  async provision(req, res) {
    const {
      params: { id },
    } = req;

    const domain = await fetchModelById(id, Domain);
    if (!domain) {
      return res.notFound();
    }

    await DomainService.provisionDomain(domain);

    return res.json(serialize(domain, true));
  },

  async dns(req, res) {
    const {
      params: { id },
    } = req;

    const domain = await fetchModelById(id, Domain);
    if (!domain) {
      return res.notFound();
    }

    const dns = await DomainService.checkDnsAndUpdateDomain(domain);

    return res.json(dns);
  },
});