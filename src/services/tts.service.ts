class TTSService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();

    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    this.voicesLoaded = this.voices.length > 0;
  }

  /**
   * Get the most natural-sounding voice available
   * Prioritizes:
   * 1. Premium/enhanced voices (Google, Microsoft natural voices)
   * 2. English voices
   * 3. Female voices (generally sound more natural)
   */
  private getBestVoice(): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded || this.voices.length === 0) {
      this.loadVoices();
    }

    if (this.voices.length === 0) {
      return null;
    }

    // Priority 1: Google/Microsoft enhanced English voices
    const premiumVoices = this.voices.filter(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.includes("Google") ||
          voice.name.includes("Microsoft") ||
          voice.name.includes("Enhanced") ||
          voice.name.includes("Premium") ||
          voice.name.includes("Natural"))
    );

    if (premiumVoices.length > 0) {
      // Prefer female voices like Samantha, Zira, or Google US English Female
      const femaleVoice = premiumVoices.find(
        (voice) =>
          voice.name.includes("Female") ||
          voice.name.includes("Samantha") ||
          voice.name.includes("Zira") ||
          voice.name.includes("Susan")
      );
      if (femaleVoice) return femaleVoice;

      return premiumVoices[0];
    }

    // Priority 2: Any English voice
    const englishVoices = this.voices.filter((voice) =>
      voice.lang.startsWith("en")
    );
    if (englishVoices.length > 0) {
      return englishVoices[0];
    }

    // Priority 3: Default voice
    return this.voices[0];
  }

  /**
   * Speak the given text out loud
   * @param text The text to speak
   * @param rate Speech rate (0.1 to 10, default 0.9 for cooking instructions)
   * @param pitch Speech pitch (0 to 2, default 1.0)
   * @returns Promise that resolves when speech is complete
   */
  async speak(
    text: string,
    rate: number = 0.9,
    pitch: number = 1.0
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any ongoing speech
      this.stop();

      // Create new utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);

      // Get the best voice
      const bestVoice = this.getBestVoice();
      if (bestVoice) {
        this.currentUtterance.voice = bestVoice;
        this.currentUtterance.lang = bestVoice.lang;
      } else {
        this.currentUtterance.lang = "en-US";
      }

      // Set speech parameters
      this.currentUtterance.rate = rate;
      this.currentUtterance.pitch = pitch;
      this.currentUtterance.volume = 1.0;

      // Event handlers
      this.currentUtterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        this.currentUtterance = null;
        reject(event);
      };

      // Start speaking
      this.synth.speak(this.currentUtterance);
    });
  }

  /**
   * Stop the current speech
   */
  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Get list of available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.voicesLoaded) {
      this.loadVoices();
    }
    return this.voices;
  }

  /**
   * Get info about the currently selected voice
   */
  getCurrentVoiceInfo(): string {
    const voice = this.getBestVoice();
    if (voice) {
      return `${voice.name} (${voice.lang})`;
    }
    return "Default system voice";
  }
}

// Export singleton instance
export const ttsService = new TTSService();
