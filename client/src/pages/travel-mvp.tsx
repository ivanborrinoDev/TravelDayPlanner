import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, ShoppingCart, MapPin, Clock, Calendar, Download, Share2, CalendarPlus, Camera, Map, Route, Plus, X, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

interface Guide {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface DetectedPlace {
  name: string;
  days: number;
}

interface DayActivity {
  time: string;
  activity: string;
}

interface ItineraryDay {
  day: number;
  place: string;
  activities: DayActivity[];
}

export default function TravelMVP() {
  const [cart, setCart] = useState<Guide[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [detectedPlaces, setDetectedPlaces] = useState<DetectedPlace[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDayPlanning, setShowDayPlanning] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryDay[]>([]);
  const [showItinerary, setShowItinerary] = useState(false);
  const cartIconRef = useRef(null);

  const guides: Guide[] = [
    {
      id: 1,
      title: "Guida India",
      image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600&q=80",
      description: "Un viaggio spirituale e culturale attraverso le meraviglie dell'India: dal Taj Mahal ai templi di Varanasi."
    },
    {
      id: 2,
      title: "Guida Thailandia",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600&q=80",
      description: "Scopri le spiagge tropicali, i mercati fluttuanti e i templi dorati in un itinerario indimenticabile."
    },
    {
      id: 3,
      title: "Guida Perù",
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600&q=80",
      description: "Un'avventura sulle Ande: Cusco, Machu Picchu e la Valle Sacra, tra storia e paesaggi mozzafiato."
    }
  ];

  const placeActivities: Record<string, DayActivity[][]> = {
    'Roma': [
      [
        { time: '09:00', activity: 'Visita al Colosseo e Foro Romano' },
        { time: '13:00', activity: 'Pranzo in una trattoria locale' },
        { time: '15:00', activity: 'Passeggiata per il centro storico' },
        { time: '18:00', activity: 'Aperitivo con vista sui Fori' }
      ],
      [
        { time: '09:00', activity: 'Musei Vaticani e Cappella Sistina' },
        { time: '13:00', activity: 'Pranzo vicino al Vaticano' },
        { time: '15:00', activity: 'Basilica di San Pietro' },
        { time: '18:00', activity: 'Aperitivo a Trastevere' }
      ],
      [
        { time: '09:00', activity: 'Fontana di Trevi e Pantheon' },
        { time: '12:00', activity: 'Villa Borghese e Galleria' },
        { time: '15:00', activity: 'Shopping via del Corso' },
        { time: '19:00', activity: 'Cena con vista sui Fori Imperiali' }
      ]
    ],
    'Parigi': [
      [
        { time: '09:00', activity: 'Torre Eiffel al mattino' },
        { time: '11:00', activity: 'Crociera sulla Senna' },
        { time: '14:00', activity: 'Pranzo in bistrot' },
        { time: '16:00', activity: 'Quartiere di Montmartre' }
      ],
      [
        { time: '09:00', activity: 'Museo del Louvre' },
        { time: '13:00', activity: 'Giardini delle Tuileries' },
        { time: '15:00', activity: 'Champs-Élysées shopping' },
        { time: '18:00', activity: 'Aperitivo parigino' }
      ],
      [
        { time: '09:00', activity: 'Sacré-Cœur e Montmartre' },
        { time: '12:00', activity: 'Quartiere Latino' },
        { time: '15:00', activity: 'Île de la Cité' },
        { time: '19:00', activity: 'Cena in un bistrot tradizionale' }
      ]
    ],
    'default': [
      [
        { time: '09:00', activity: 'Esplorazione del centro storico' },
        { time: '12:00', activity: 'Visita ai principali monumenti' },
        { time: '14:00', activity: 'Pranzo con specialità locali' },
        { time: '16:00', activity: 'Tour guidato della città' }
      ],
      [
        { time: '09:00', activity: 'Musei e gallerie d\'arte' },
        { time: '12:00', activity: 'Parchi e giardini' },
        { time: '15:00', activity: 'Shopping nei mercati locali' },
        { time: '18:00', activity: 'Esperienza culinaria locale' }
      ],
      [
        { time: '09:00', activity: 'Escursioni nei dintorni' },
        { time: '13:00', activity: 'Pranzo panoramico' },
        { time: '15:00', activity: 'Attività culturali' },
        { time: '19:00', activity: 'Vita notturna e intrattenimento' }
      ]
    ]
  };

  const callVisionAPI = async (base64Image: string): Promise<string | null> => {
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY || "AIzaSyBjCbFv7HdNFK15va0cPPy6my4SnQTLZNQ";
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const body = {
      requests: [
        {
          image: { content: base64Image.split(",")[1] },
          features: [{ type: "LANDMARK_DETECTION", maxResults: 1 }]
        }
      ]
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.error) {
        console.error("Errore Vision API:", data.error.message);
        return null;
      }

      const landmark = data.responses?.[0]?.landmarkAnnotations?.[0]?.description;
      return landmark;
    } catch (error) {
      console.error("Errore Vision API:", error);
      return null;
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsAnalyzing(true);
    const previewsArray: string[] = [];
    const detectedPlacesArray: string[] = [];

    for (const file of files) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          if (reader.result) {
            previewsArray.push(reader.result as string);
            const place = await callVisionAPI(reader.result as string);
            if (place) detectedPlacesArray.push(place);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setPreviews(previewsArray);

    // Remove duplicates and create DetectedPlace objects with default 3 days
    const uniquePlaces = Array.from(new Set(detectedPlacesArray)).filter(Boolean);
    let placesWithDays: DetectedPlace[] = uniquePlaces.map(place => ({
      name: place,
      days: 3
    }));

    // Se non vengono rilevati luoghi, aggiungi luoghi di esempio per permettere all'utente di iniziare
    if (placesWithDays.length === 0) {
      placesWithDays = [
        { name: "Destinazione 1", days: 3 },
        { name: "Destinazione 2", days: 2 }
      ];
    }

    setDetectedPlaces(placesWithDays);
    setIsAnalyzing(false);
    setShowDayPlanning(true);
  };

  const updatePlaceDays = (placeName: string, days: number) => {
    setDetectedPlaces(prev => 
      prev.map(place => 
        place.name === placeName ? { ...place, days } : place
      )
    );
  };

  const updatePlaceName = (oldName: string, newName: string) => {
    setDetectedPlaces(prev => 
      prev.map(place => 
        place.name === oldName ? { ...place, name: newName } : place
      )
    );
  };

  const addNewPlace = () => {
    setDetectedPlaces(prev => [...prev, { name: `Nuova Destinazione ${prev.length + 1}`, days: 2 }]);
  };

  const removePlace = (placeName: string) => {
    setDetectedPlaces(prev => prev.filter(place => place.name !== placeName));
  };

  const generateDetailedItinerary = () => {
    const itinerary: ItineraryDay[] = [];
    let currentDay = 1;

    detectedPlaces.forEach(place => {
      const activities = placeActivities[place.name] || placeActivities['default'];

      for (let day = 0; day < place.days; day++) {
        const dayActivities = activities[day % activities.length];

        itinerary.push({
          day: currentDay,
          place: place.name,
          activities: dayActivities
        });

        currentDay++;
      }
    });

    setGeneratedItinerary(itinerary);
    setShowItinerary(true);
  };

  const addToCart = (item: Guide) => {
    setCart(prev => [...prev, item]);
  };

  const handlePurchase = (item: Guide) => {
    addToCart(item);
    alert(`Stai per acquistare: ${item.title}. Procedi al pagamento...`);
  };

  const getTotalDays = () => {
    return detectedPlaces.reduce((total, place) => total + place.days, 0);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">Dosi di Viaggio</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="#travel-guides" className="text-gray-600 hover:text-gray-900 transition-colors">Guide</a>
              <a href="#ai-planner" className="text-gray-600 hover:text-gray-900 transition-colors">AI Planner</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">Chi Siamo</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2" ref={cartIconRef}>
              <ShoppingCart className="w-5 h-5 mr-2 text-gray-700" />
              <span className="text-sm font-medium">{cart.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
            Crea il tuo viaggio perfetto
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light opacity-90">
            Intelligenza artificiale per itinerari personalizzati dalle tue foto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-medium rounded-full"
              onClick={() => document.getElementById('ai-planner')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Inizia ora
            </Button>
            <Button 
              className="bg-gray-900 text-white hover:bg-white hover:text-gray-900 border border-gray-900 hover:border-white px-8 py-3 text-lg font-medium rounded-full transition-colors"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Scopri di più
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-light mb-6 text-gray-900">Chi Siamo</h2>
              <p className="text-lg leading-relaxed text-gray-600 mb-6">
                Sono una fotografa e storyteller che viaggia per il mondo per raccontare storie autentiche. Ho camminato tra le rovine del Perù, attraversato deserti marocchini e condiviso tè con monaci in Giappone.
              </p>
              <p className="text-lg leading-relaxed text-gray-600 mb-8">
                Ogni viaggio è per me un'occasione per osservare, ascoltare e narrare. Se ami i viaggi lenti, profondi e pieni di emozioni, sei nel posto giusto.
              </p>
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">47</div>
                  <div className="text-sm text-gray-600">Paesi visitati</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">200+</div>
                  <div className="text-sm text-gray-600">Itinerari creati</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">5K</div>
                  <div className="text-sm text-gray-600">Viaggiatori felici</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616c40e6e25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" 
                alt="Travel photographer" 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <Camera className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Photography</div>
                    <div className="text-sm text-gray-600">& Storytelling</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Guides Shop */}
      <section id="travel-guides" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4 text-gray-900">Guide di Viaggio</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scopri le mie guide dettagliate per creare viaggi indimenticabili
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <Card key={guide.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl">
                <div className="relative overflow-hidden">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{guide.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{guide.description}</p>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gray-900 text-white hover:bg-gray-800 py-3 rounded-full font-medium" 
                      onClick={() => addToCart(guide)}
                    >
                      Aggiungi al carrello
                    </Button>
                    <Button
                      className="w-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white py-3 rounded-full font-medium"
                      onClick={() => handlePurchase(guide)}
                    >
                      Acquista ora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Travel Planner Section */}
      <section id="ai-planner" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4 text-gray-900">
              AI Travel Planner
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Carica le tue foto di viaggio e lascia che la nostra intelligenza artificiale 
              crei un itinerario personalizzato basato sui luoghi che hai visitato
            </p>
          </div>

          {/* Photo Upload Area */}
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors">
              <div className="max-w-md mx-auto">
                <UploadCloud className="mx-auto mb-6 w-16 h-16 text-blue-500" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Carica le tue foto</h3>
                <p className="text-gray-600 mb-6">
                  Seleziona multiple foto dei luoghi che vuoi visitare o hai visitato
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Scegli foto
                </label>
              </div>
            </div>

            {/* Photo Previews */}
            {previews.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Foto caricate:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Anteprima ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isAnalyzing && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center px-6 py-3 font-medium text-white bg-blue-600 rounded-full">
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Analizzando le foto...
                </div>
              </div>
            )}
          </div>

          {/* Day Planning Section */}
          {showDayPlanning && (
            <motion.div
              className="fade-in"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-light mb-6 text-center text-gray-900">Pianifica i tuoi giorni</h3>
                <p className="text-center text-gray-600 mb-8">
                  Specifica quanti giorni vuoi trascorrere in ogni destinazione
                </p>
                <div className="space-y-4">
                  {detectedPlaces.map((place, index) => (
                    <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                        <MapPin className="w-6 h-6 text-blue-600" />
                        <Input
                          type="text"
                          value={place.name}
                          onChange={(e) => updatePlaceName(place.name, e.target.value)}
                          className="font-semibold bg-transparent border-none p-0 focus:bg-white focus:border focus:p-3 transition-all text-lg"
                          placeholder="Nome destinazione"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="text-sm text-gray-600 font-medium">Giorni:</label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={place.days}
                          onChange={(e) => updatePlaceDays(place.name, parseInt(e.target.value) || 1)}
                          className="w-20 text-center font-semibold border-gray-300 focus:border-blue-500"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlace(place.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={addNewPlace}
                    variant="outline"
                    className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-full font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Aggiungi Destinazione
                  </Button>
                </div>

                <Button
                  onClick={generateDetailedItinerary}
                  className="w-full mt-8 bg-gray-900 text-white hover:bg-gray-800 py-4 text-lg font-medium rounded-full"
                  disabled={detectedPlaces.length === 0}
                >
                  <Route className="w-6 h-6 mr-2" />
                  Genera Itinerario Dettagliato
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Generated Itinerary Section */}
      {showItinerary && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              className="fade-in"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-12">
                <h4 className="text-4xl font-light mb-4 text-gray-900 flex items-center justify-center">
                  <Map className="w-8 h-8 mr-3 text-blue-600" />
                  Il tuo Itinerario Personalizzato
                </h4>
                <p className="text-xl text-gray-600">Un viaggio su misura per te</p>
              </div>

              <div className="grid gap-6">
                {generatedItinerary.map((dayPlan, index) => (
                  <div key={index} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                      <div className="flex items-center text-white">
                        <div className="bg-white/20 rounded-full px-4 py-2 mr-4">
                          <span className="font-bold">Giorno {dayPlan.day}</span>
                        </div>
                        <h5 className="text-xl font-semibold">{dayPlan.place}</h5>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {dayPlan.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-start p-4 bg-gray-50 rounded-2xl">
                            <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-900 mr-3">{activity.time}</span>
                              <span className="text-gray-700">{activity.activity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Card */}
              <div className="bg-gray-900 text-white p-8 rounded-3xl mt-12">
                <h6 className="text-2xl font-light mb-6 text-center">Riepilogo del Viaggio</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-3xl font-bold mb-1">{getTotalDays()}</div>
                    <div className="text-gray-300">Giorni totali</div>
                  </div>
                  <div className="text-center">
                    <Map className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <div className="text-3xl font-bold mb-1">{detectedPlaces.length}</div>
                    <div className="text-gray-300">Destinazioni</div>
                  </div>
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-3xl font-bold mb-1">{previews.length}</div>
                    <div className="text-gray-300">Foto analizzate</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-medium">
                  <Download className="w-5 h-5 mr-2" />
                  Scarica PDF
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-medium">
                  <Share2 className="w-5 h-5 mr-2" />
                  Condividi Itinerario
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-full font-medium">
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Aggiungi al Calendario
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-light mb-4">Seguimi sui Social</h3>
            <p className="text-xl text-gray-300 mb-8">Scopri le mie avventure quotidiane e i dietro le quinte dei miei viaggi</p>
            <div className="flex justify-center space-x-6">
              <a
                href="https://www.instagram.com/ivanborrino"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                <span className="font-medium">@ivanborrino</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}