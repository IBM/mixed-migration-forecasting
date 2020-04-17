const validators = {
  validateFieldLength: function(e) {
    const isValid =
      (typeof e === 'string' && e.trim() !== '') ||
      (Array.isArray(e) && e.length);
    const invalidLength = !isValid;

    return invalidLength;
  },

  invalidFieldExists: function(e) {
    let invalid = false;
    const state = e;

    // if (
    //   state.errors.authorsError ||
    //   !state.report.authors ||
    //   state.errors.titleError ||
    //   !state.report.title ||
    //   state.report.editorState === '' ||
    //   state.errors.editorTextError
    // ) {
    //   invalid = true;
    // }

    return invalid;
  },
};

export default validators;
