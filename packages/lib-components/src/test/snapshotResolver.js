module.exports = {
  /**
   *
   * @param testPath Path of the test file being tested
   * @param snapshotExtension The extension for snapshots (.snap usually)
   */
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    return testPath + snapshotExtension;
  },

  /**
   *
   * @param snapshotFilePath The filename of the snapshot (i.e. some.test.js.snap)
   * @param snapshotExtension The extension for snapshots (.snap)
   */
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath.replace(snapshotExtension, ''),

  /* Used to validate resolveTestPath(resolveSnapshotPath( {this} )) */
  testPathForConsistencyCheck: 'some.test.js'
};
