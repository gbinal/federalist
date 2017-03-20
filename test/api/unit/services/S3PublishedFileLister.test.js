const AWSMocks = require('../../support/aws-mocks')
const expect = require("chai").expect
const factory = require("../../support/factory")
const config = require("../../../../config")

const S3PublishedFileLister = require("../../../../api/services/S3PublishedFileLister")

describe("S3PublishedFileLister", () => {
  after(() => {
    AWSMocks.resetMocks()
  })

  describe(".listPublishedPreviews(site)", () => {
    it("should resolve with a list of published previews for the given site", done => {
      let site

      AWSMocks.mocks.S3.listObjects = (params, callback) => {
        expect(params.Bucket).to.equal(config.s3.bucket)
        expect(params.Prefix).to.equal(`preview/${site.owner}/${site.repository}/`)
        expect(params.Delimiter).to.equal("/")
        callback(null, {
          Contents: [],
          CommonPrefixes: [
            { Prefix: `preview/${site.owner}/${site.repository}/abc/` },
            { Prefix: `preview/${site.owner}/${site.repository}/def/` },
            { Prefix: `preview/${site.owner}/${site.repository}/ghi/` },
          ],
        })
      }

      factory.site().then(model => {
        site = model
        return S3PublishedFileLister.listPublishedPreviews(site)
      }).then(publishedPreviews => {
        expect(publishedPreviews).to.deep.equal(["abc", "def", "ghi"])
        done()
      }).catch(done)
    })
  })

  describe(".listPublishedFilesForBranch(site, branch)", () => {
    it("should resolve with a list of files for the site's default branch", done => {
      let site

      AWSMocks.mocks.S3.listObjects = (params, callback) => {
        const prefix = `site/${site.owner}/${site.repository}`
        expect(params.Bucket).to.equal(config.s3.bucket)
        expect(params.Prefix).to.equal(prefix)

        callback(null, {
          Contents: [
            { Key: `${prefix}/abc` },
            { Key: `${prefix}/abc/def` },
            { Key: `${prefix}/ghi` },
          ]
        })
      }

      factory.site({ defaultBranch: "master" }).then(model => {
        site = model
        return S3PublishedFileLister.listPublishedFilesForBranch(site, "master")
      }).then(publishedFiles => {
        expect(publishedFiles).to.deep.equal(["abc", "abc/def", "ghi"])
        done()
      }).catch(done)
    })

    it("should resolve with a list of files for a preview branch", done => {
      let site

      AWSMocks.mocks.S3.listObjects = (params, callback) => {
        const prefix = `preview/${site.owner}/${site.repository}/preview`
        expect(params.Bucket).to.equal(config.s3.bucket)
        expect(params.Prefix).to.equal(prefix)

        callback(null, {
          Contents: [
            { Key: `${prefix}/abc` },
            { Key: `${prefix}/abc/def` },
            { Key: `${prefix}/ghi` },
          ]
        })
      }

      factory.site({ defaultBranch: "master" }).then(model => {
        site = model
        return S3PublishedFileLister.listPublishedFilesForBranch(site, "preview")
      }).then(publishedFiles => {
        expect(publishedFiles).to.deep.equal(["abc", "abc/def", "ghi"])
        done()
      }).catch(done)
    })

    it("should reject with an error if S3.listObjects is unsuccessful", done => {
      AWSMocks.mocks.S3.listObjects = (params, cb) => cb(new Error("Test error"))

      factory.site().then(model => {
        return S3PublishedFileLister.listPublishedFilesForBranch(site, "preview")
      }).catch(err => {
        expect(err.message).to.equal("Test error")
        done()
      }).catch(done)
    })
  })
})
