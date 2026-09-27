// Configuração Firebase do App do Cliente gerada para Cloud Firestore
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAgd7zSYdS1Q8ql0RD4yFvQEOMiSVuDWVo',
    appId: '1:418940915160:web:7a4619da31f3aecf0db6ad',
    messagingSenderId: '418940915160',
    projectId: 'gen-lang-client-0687608525',
    authDomain: 'gen-lang-client-0687608525.firebaseapp.com',
    storageBucket: 'gen-lang-client-0687608525.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAgd7zSYdS1Q8ql0RD4yFvQEOMiSVuDWVo',
    appId: '1:418940915160:android:7a4619da31f3aecf0db6ad',
    messagingSenderId: '418940915160',
    projectId: 'gen-lang-client-0687608525',
    storageBucket: 'gen-lang-client-0687608525.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAgd7zSYdS1Q8ql0RD4yFvQEOMiSVuDWVo',
    appId: '1:418940915160:ios:7a4619da31f3aecf0db6ad',
    messagingSenderId: '418940915160',
    projectId: 'gen-lang-client-0687608525',
    storageBucket: 'gen-lang-client-0687608525.firebasestorage.app',
    iosBundleId: 'com.proservicos.client',
  );
}
