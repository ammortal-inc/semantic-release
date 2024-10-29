import semver from "semver";
import { FIRST_RELEASE, FIRSTPRERELEASE } from "./definitions/constants.js";
import { getLatestVersion, highest, isSameChannel, tagsToVersions } from "./utils.js";

export default ({ branch, nextRelease: { type, channel }, lastRelease, logger }) => {
  let version;
  if (lastRelease.version) {
    const { major, minor, patch } = semver.parse(lastRelease.version);

    logger.log("Last Release:", lastRelease);

    if (branch.type === "prerelease") {

      logger.log("PRERELEASE");
      logger.log("type: ", type);
      logger.log("Prelease of Last Release?", semver.prerelease(lastRelease.version));
      logger.log("Channels match between this and last?", lastRelease.channels.some((lastReleaseChannel) => isSameChannel(lastReleaseChannel, channel)));
      logger.log("Increase prerelease of last version", semver.inc(lastRelease.version, "prerelease"))
      logger.log("Tags to versions", tagsToVersions(branch.tags))
      logger.log("getLatestVersion withPrerelease=true", getLatestVersion(tagsToVersions(branch.tags), { withPrerelease: true }))
      logger.log("???", `${semver.inc(getLatestVersion(tagsToVersions(branch.tags), { withPrerelease: true }), type)}-${branch.prerelease}.${FIRSTPRERELEASE}`);
      logger.log("Increase release???", `${semver.inc(`${major}.${minor}.${patch}`, type)}-${branch.prerelease}.${FIRSTPRERELEASE}`);

      if (
        semver.prerelease(lastRelease.version) &&
        lastRelease.channels.some((lastReleaseChannel) => isSameChannel(lastReleaseChannel, channel))
      ) {
        logger.log("Same channel!");
        version = highest(
          semver.inc(lastRelease.version, "prerelease"),
          `${semver.inc(getLatestVersion(tagsToVersions(branch.tags), { withPrerelease: true }), type)}-${
            branch.prerelease
          }.${FIRSTPRERELEASE}`
        );
      } else {
        logger.log("Different channels!");
        version = `${semver.inc(`${major}.${minor}.${patch}`, type)}-${branch.prerelease}.${FIRSTPRERELEASE}`;
      }
    } else {

      logger.log("RELEASE");
      logger.log("Incremented:", semver.inc(lastRelease.version, type));

      version = semver.inc(lastRelease.version, type);
    }

    logger.log("The next release version is %s", version);
  } else {
    version = branch.type === "prerelease" ? `${FIRST_RELEASE}-${branch.prerelease}.${FIRSTPRERELEASE}` : FIRST_RELEASE;
    logger.log(`There is no previous release, the next release version is ${version}`);
  }

  return version;
};
